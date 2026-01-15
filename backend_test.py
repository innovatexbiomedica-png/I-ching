import requests
import sys
import json
from datetime import datetime

class IChingAPITester:
    def __init__(self, base_url="https://error-zapper-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token and 'Authorization' not in test_headers:
            test_headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail = response.json()
                    error_msg += f" - {error_detail}"
                except:
                    error_msg += f" - {response.text[:200]}"
                
                self.log_test(name, False, error_msg)
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"test_user_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Test User {timestamp}",
            "language": "it"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'id' in response:
            self.user_id = response['id']
            self.test_email = test_user['email']
            self.test_password = test_user['password']
            return True
        return False

    def test_user_registration_with_phone(self):
        """Test user registration with phone field"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"phone_user_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Phone User {timestamp}",
            "phone": "+39 123 456 7890",
            "language": "it"
        }
        
        success, response = self.run_test(
            "User Registration with Phone",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if success and 'id' in response and 'phone' in response:
            print(f"   Phone field returned: {response.get('phone', 'Not found')}")
            self.phone_user_email = test_user['email']
            self.phone_user_password = test_user['password']
            self.phone_user_phone = test_user['phone']
            return True
        return False

    def test_password_reset_request(self):
        """Test password reset request"""
        if not hasattr(self, 'phone_user_email'):
            self.log_test("Password Reset Request", False, "No phone user created")
            return False
            
        reset_data = {
            "email": self.phone_user_email,
            "phone": self.phone_user_phone
        }
        
        success, response = self.run_test(
            "Password Reset Request",
            "POST",
            "auth/request-reset",
            200,
            data=reset_data
        )
        
        if success and 'message' in response:
            print(f"   Reset message: {response.get('message', '')}")
            return True
        return False

    def test_password_reset_request_invalid_email(self):
        """Test password reset request with invalid email"""
        reset_data = {
            "email": "nonexistent@test.com",
            "phone": "+39 999 999 9999"
        }
        
        success, response = self.run_test(
            "Password Reset Request (Invalid Email)",
            "POST",
            "auth/request-reset",
            200,  # Should still return 200 for security
            data=reset_data
        )
        
        if success and 'message' in response:
            print(f"   Security message: {response.get('message', '')}")
            return True
        return False

    def test_admin_reset_requests(self):
        """Test admin endpoint for reset requests"""
        success, response = self.run_test(
            "Admin Reset Requests",
            "GET",
            "admin/reset-requests",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} pending reset requests")
            if len(response) > 0:
                # Store the reset code for verification test
                self.reset_code = response[0].get('code')
                self.reset_email = response[0].get('email')
                print(f"   Latest reset code: {self.reset_code}")
            return True
        return False

    def test_password_reset_verify_invalid_code(self):
        """Test password reset verification with invalid code"""
        if not hasattr(self, 'phone_user_email'):
            self.log_test("Password Reset Verify (Invalid Code)", False, "No phone user created")
            return False
            
        verify_data = {
            "email": self.phone_user_email,
            "code": "999999",  # Invalid code
            "new_password": "NewPassword123!"
        }
        
        success, response = self.run_test(
            "Password Reset Verify (Invalid Code)",
            "POST",
            "auth/verify-reset",
            400,  # Should fail
            data=verify_data
        )
        return success

    def test_password_reset_verify_short_password(self):
        """Test password reset verification with short password"""
        if not hasattr(self, 'reset_code') or not hasattr(self, 'reset_email'):
            self.log_test("Password Reset Verify (Short Password)", False, "No reset code available")
            return False
            
        verify_data = {
            "email": self.reset_email,
            "code": self.reset_code,
            "new_password": "123"  # Too short
        }
        
        success, response = self.run_test(
            "Password Reset Verify (Short Password)",
            "POST",
            "auth/verify-reset",
            400,  # Should fail
            data=verify_data
        )
        return success

    def test_password_reset_verify_valid(self):
        """Test password reset verification with valid code"""
        if not hasattr(self, 'reset_code') or not hasattr(self, 'reset_email'):
            self.log_test("Password Reset Verify (Valid)", False, "No reset code available")
            return False
            
        verify_data = {
            "email": self.reset_email,
            "code": self.reset_code,
            "new_password": "NewPassword123!"
        }
        
        success, response = self.run_test(
            "Password Reset Verify (Valid)",
            "POST",
            "auth/verify-reset",
            200,
            data=verify_data
        )
        
        if success:
            self.new_password = verify_data['new_password']
            print(f"   Password reset successful")
            return True
        return False

    def test_login_with_new_password(self):
        """Test login with new password after reset"""
        if not hasattr(self, 'reset_email') or not hasattr(self, 'new_password'):
            self.log_test("Login with New Password", False, "No password reset completed")
            return False
            
        login_data = {
            "email": self.reset_email,
            "password": self.new_password
        }
        
        success, response = self.run_test(
            "Login with New Password",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            print(f"   Login successful with new password")
            return True
        return False

    def test_login_with_old_password_should_fail(self):
        """Test login with old password should fail after reset"""
        if not hasattr(self, 'phone_user_email') or not hasattr(self, 'phone_user_password'):
            self.log_test("Login with Old Password (Should Fail)", False, "No original password available")
            return False
            
        login_data = {
            "email": self.phone_user_email,
            "password": self.phone_user_password  # Old password
        }
        
        success, response = self.run_test(
            "Login with Old Password (Should Fail)",
            "POST",
            "auth/login",
            401,  # Should fail
            data=login_data
        )
        return success

    def test_user_login(self):
        """Test user login"""
        if not hasattr(self, 'test_email'):
            self.log_test("User Login", False, "No test user created")
            return False
            
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_user_profile(self):
        """Test get current user profile"""
        if not self.token:
            self.log_test("Get User Profile", False, "No auth token")
            return False
            
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_language_update(self):
        """Test language update"""
        if not self.token:
            self.log_test("Language Update", False, "No auth token")
            return False
            
        success, response = self.run_test(
            "Language Update",
            "PUT",
            "auth/language?language=en",
            200
        )
        return success

    def test_consultation_without_subscription(self):
        """Test consultation creation without subscription (should fail)"""
        if not self.token:
            self.log_test("Consultation Without Subscription", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "What should I focus on today?",
            "coin_tosses": {
                "line1": 7,
                "line2": 8,
                "line3": 9,
                "line4": 6,
                "line5": 7,
                "line6": 8
            }
        }
        
        success, response = self.run_test(
            "Consultation Without Subscription",
            "POST",
            "consultations",
            403,  # Should fail with 403
            data=consultation_data
        )
        return success

    def test_activate_subscription_manually(self):
        """Manually activate subscription for testing"""
        if not self.user_id:
            self.log_test("Manual Subscription Activation", False, "No user ID")
            return False
            
        # This would normally be done through Stripe, but for testing we'll simulate it
        print("🔧 Manually activating subscription for testing...")
        
        # We'll test the consultation endpoint after this to see if it works
        return True

    def test_stripe_checkout_creation(self):
        """Test Stripe checkout session creation"""
        if not self.token:
            self.log_test("Stripe Checkout Creation", False, "No auth token")
            return False
            
        checkout_data = {
            "origin_url": "https://error-zapper-3.preview.emergentagent.com"
        }
        
        success, response = self.run_test(
            "Stripe Checkout Creation",
            "POST",
            "payments/checkout",
            200,
            data=checkout_data
        )
        
        if success and 'url' in response:
            print(f"   Checkout URL created: {response['url'][:50]}...")
            return True
        return False

    def test_get_hexagrams(self):
        """Test hexagram data retrieval"""
        success, response = self.run_test(
            "Get All Hexagrams",
            "GET",
            "hexagrams",
            200
        )
        
        if success and isinstance(response, dict) and len(response) == 64:
            print(f"   Retrieved {len(response)} hexagrams")
            return True
        return False

    def test_get_single_hexagram(self):
        """Test single hexagram retrieval"""
        success, response = self.run_test(
            "Get Single Hexagram",
            "GET",
            "hexagrams/1",
            200
        )
        
        if success and 'name' in response:
            print(f"   Hexagram 1: {response.get('name', 'Unknown')}")
            return True
        return False

    def test_consultation_history_empty(self):
        """Test consultation history (should be empty initially)"""
        if not self.token:
            self.log_test("Consultation History (Empty)", False, "No auth token")
            return False
            
        success, response = self.run_test(
            "Consultation History (Empty)",
            "GET",
            "consultations",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} consultations")
            return True
        return False

    def test_create_consultation_1(self):
        """Create first consultation for synthesis testing"""
        if not self.token:
            self.log_test("Create Consultation 1", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "What should I focus on in my career?",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 8,  # Yin
                "line3": 9,  # Old Yang (moving)
                "line4": 6,  # Old Yin (moving)
                "line5": 7,  # Yang
                "line6": 8   # Yin
            }
        }
        
        success, response = self.run_test(
            "Create Consultation 1",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.consultation_1_id = response['id']
            print(f"   Created consultation 1: {response.get('hexagram_name', 'Unknown')}")
            return True
        return False

    def test_create_consultation_2(self):
        """Create second consultation for synthesis testing"""
        if not self.token:
            self.log_test("Create Consultation 2", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "How can I improve my relationships?",
            "coin_tosses": {
                "line1": 6,  # Old Yin (moving)
                "line2": 7,  # Yang
                "line3": 8,  # Yin
                "line4": 9,  # Old Yang (moving)
                "line5": 6,  # Old Yin (moving)
                "line6": 7   # Yang
            }
        }
        
        success, response = self.run_test(
            "Create Consultation 2",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.consultation_2_id = response['id']
            print(f"   Created consultation 2: {response.get('hexagram_name', 'Unknown')}")
            return True
        return False

    def test_create_consultation_3(self):
        """Create third consultation for synthesis testing"""
        if not self.token:
            self.log_test("Create Consultation 3", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "What is blocking my personal growth?",
            "coin_tosses": {
                "line1": 8,  # Yin
                "line2": 9,  # Old Yang (moving)
                "line3": 7,  # Yang
                "line4": 8,  # Yin
                "line5": 9,  # Old Yang (moving)
                "line6": 6   # Old Yin (moving)
            }
        }
        
        success, response = self.run_test(
            "Create Consultation 3",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.consultation_3_id = response['id']
            print(f"   Created consultation 3: {response.get('hexagram_name', 'Unknown')}")
            return True
        return False

    def test_synthesis_with_one_consultation_should_fail(self):
        """Test synthesis with only 1 consultation (should fail - minimum 2 required)"""
        if not self.token or not hasattr(self, 'consultation_1_id'):
            self.log_test("Synthesis with 1 Consultation (Should Fail)", False, "No auth token or consultation")
            return False
            
        synthesis_data = {
            "consultation_ids": [self.consultation_1_id],
            "synthesis_type": "deepening"
        }
        
        success, response = self.run_test(
            "Synthesis with 1 Consultation (Should Fail)",
            "POST",
            "consultations/synthesis",
            400,  # Should fail
            data=synthesis_data
        )
        return success

    def test_synthesis_with_nonexistent_consultation_should_fail(self):
        """Test synthesis with non-existent consultation ID (should fail)"""
        if not self.token or not hasattr(self, 'consultation_1_id'):
            self.log_test("Synthesis with Non-existent ID (Should Fail)", False, "No auth token or consultation")
            return False
            
        synthesis_data = {
            "consultation_ids": [self.consultation_1_id, "non-existent-id-12345"],
            "synthesis_type": "confirmation"
        }
        
        success, response = self.run_test(
            "Synthesis with Non-existent ID (Should Fail)",
            "POST",
            "consultations/synthesis",
            404,  # Should fail
            data=synthesis_data
        )
        return success

    def test_synthesis_with_too_many_consultations_should_fail(self):
        """Test synthesis with more than 5 consultations (should fail - maximum 5)"""
        if not self.token or not hasattr(self, 'consultation_1_id'):
            self.log_test("Synthesis with Too Many Consultations (Should Fail)", False, "No auth token or consultation")
            return False
            
        # Create fake IDs to simulate having more than 5
        fake_ids = [f"fake-id-{i}" for i in range(6)]
        synthesis_data = {
            "consultation_ids": fake_ids,
            "synthesis_type": "clarification"
        }
        
        success, response = self.run_test(
            "Synthesis with Too Many Consultations (Should Fail)",
            "POST",
            "consultations/synthesis",
            400,  # Should fail
            data=synthesis_data
        )
        return success

    def test_synthesis_confirmation_type(self):
        """Test synthesis with confirmation type"""
        if not self.token or not hasattr(self, 'consultation_1_id') or not hasattr(self, 'consultation_2_id'):
            self.log_test("Synthesis Confirmation Type", False, "No auth token or consultations")
            return False
            
        synthesis_data = {
            "consultation_ids": [self.consultation_1_id, self.consultation_2_id],
            "synthesis_type": "confirmation"
        }
        
        success, response = self.run_test(
            "Synthesis Confirmation Type",
            "POST",
            "consultations/synthesis",
            200,
            data=synthesis_data
        )
        
        if success and 'id' in response:
            # Verify synthesis fields
            if (response.get('is_synthesis') == True and 
                response.get('synthesis_type') == 'confirmation' and
                response.get('linked_consultation_ids') == [self.consultation_1_id, self.consultation_2_id]):
                print(f"   ✅ Synthesis created with correct fields")
                print(f"   Question: {response.get('question', '')[:100]}...")
                print(f"   Interpretation length: {len(response.get('interpretation', ''))}")
                self.synthesis_confirmation_id = response['id']
                return True
            else:
                self.log_test("Synthesis Confirmation Type", False, "Missing synthesis fields in response")
                return False
        return False

    def test_synthesis_deepening_type(self):
        """Test synthesis with deepening type"""
        if not self.token or not hasattr(self, 'consultation_2_id') or not hasattr(self, 'consultation_3_id'):
            self.log_test("Synthesis Deepening Type", False, "No auth token or consultations")
            return False
            
        synthesis_data = {
            "consultation_ids": [self.consultation_2_id, self.consultation_3_id],
            "synthesis_type": "deepening"
        }
        
        success, response = self.run_test(
            "Synthesis Deepening Type",
            "POST",
            "consultations/synthesis",
            200,
            data=synthesis_data
        )
        
        if success and 'id' in response:
            # Verify synthesis fields
            if (response.get('is_synthesis') == True and 
                response.get('synthesis_type') == 'deepening' and
                response.get('linked_consultation_ids') == [self.consultation_2_id, self.consultation_3_id]):
                print(f"   ✅ Synthesis created with correct fields")
                print(f"   Question: {response.get('question', '')[:100]}...")
                print(f"   Interpretation length: {len(response.get('interpretation', ''))}")
                self.synthesis_deepening_id = response['id']
                return True
            else:
                self.log_test("Synthesis Deepening Type", False, "Missing synthesis fields in response")
                return False
        return False

    def test_synthesis_clarification_type(self):
        """Test synthesis with clarification type using all 3 consultations"""
        if (not self.token or not hasattr(self, 'consultation_1_id') or 
            not hasattr(self, 'consultation_2_id') or not hasattr(self, 'consultation_3_id')):
            self.log_test("Synthesis Clarification Type", False, "No auth token or consultations")
            return False
            
        synthesis_data = {
            "consultation_ids": [self.consultation_1_id, self.consultation_2_id, self.consultation_3_id],
            "synthesis_type": "clarification"
        }
        
        success, response = self.run_test(
            "Synthesis Clarification Type",
            "POST",
            "consultations/synthesis",
            200,
            data=synthesis_data
        )
        
        if success and 'id' in response:
            # Verify synthesis fields
            expected_ids = [self.consultation_1_id, self.consultation_2_id, self.consultation_3_id]
            if (response.get('is_synthesis') == True and 
                response.get('synthesis_type') == 'clarification' and
                response.get('linked_consultation_ids') == expected_ids):
                print(f"   ✅ Synthesis created with correct fields")
                print(f"   Question: {response.get('question', '')[:100]}...")
                print(f"   Interpretation length: {len(response.get('interpretation', ''))}")
                self.synthesis_clarification_id = response['id']
                return True
            else:
                self.log_test("Synthesis Clarification Type", False, "Missing synthesis fields in response")
                return False
        return False

    def test_consultation_history_with_synthesis(self):
        """Test consultation history includes synthesis consultations with proper fields"""
        if not self.token:
            self.log_test("Consultation History with Synthesis", False, "No auth token")
            return False
            
        success, response = self.run_test(
            "Consultation History with Synthesis",
            "GET",
            "consultations",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} total consultations")
            
            # Find synthesis consultations
            synthesis_consultations = [c for c in response if c.get('is_synthesis', False)]
            regular_consultations = [c for c in response if not c.get('is_synthesis', False)]
            
            print(f"   Regular consultations: {len(regular_consultations)}")
            print(f"   Synthesis consultations: {len(synthesis_consultations)}")
            
            # Verify synthesis consultations have required fields
            for synthesis in synthesis_consultations:
                if not all(key in synthesis for key in ['is_synthesis', 'linked_consultation_ids', 'synthesis_type']):
                    self.log_test("Consultation History with Synthesis", False, "Synthesis missing required fields")
                    return False
                print(f"   Synthesis type: {synthesis.get('synthesis_type')} with {len(synthesis.get('linked_consultation_ids', []))} linked consultations")
            
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting I Ching API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_user_registration,
            self.test_user_registration_with_phone,
            self.test_user_login,
            self.test_get_user_profile,
            self.test_language_update,
            self.test_password_reset_request,
            self.test_password_reset_request_invalid_email,
            self.test_admin_reset_requests,
            self.test_password_reset_verify_invalid_code,
            self.test_password_reset_verify_short_password,
            self.test_password_reset_verify_valid,
            self.test_login_with_new_password,
            self.test_login_with_old_password_should_fail,
            self.test_consultation_without_subscription,
            self.test_stripe_checkout_creation,
            self.test_get_hexagrams,
            self.test_get_single_hexagram,
            self.test_consultation_history_empty,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = IChingAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())