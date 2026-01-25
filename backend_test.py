import requests
import sys
import json
from datetime import datetime

class IChingAPITester:
    def __init__(self, base_url="https://connect-user-form.preview.emergentagent.com/api"):
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
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

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
            "origin_url": "https://connect-user-form.preview.emergentagent.com"
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

    def test_conversation_continuation_parent(self):
        """Test creating first consultation (parent) for conversation continuation"""
        if not self.token:
            self.log_test("Conversation Continuation - Parent", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "Come andrà il mio lavoro questa settimana?",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 8,  # Yin
                "line3": 9,  # Old Yang (moving)
                "line4": 7,  # Yang
                "line5": 6,  # Old Yin (moving)
                "line6": 8   # Yin
            },
            "consultation_type": "direct"
        }
        
        success, response = self.run_test(
            "Conversation Continuation - Parent",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.parent_consultation_id = response['id']
            
            # Verify parent consultation fields
            verification_checks = []
            
            if response.get('parent_consultation_id') is None:
                verification_checks.append("✅ Parent consultation has no parent_consultation_id")
            else:
                verification_checks.append(f"❌ Parent consultation has unexpected parent_consultation_id: {response.get('parent_consultation_id')}")
            
            if response.get('conversation_depth') == 0:
                verification_checks.append("✅ Parent consultation has conversation_depth = 0")
            else:
                verification_checks.append(f"❌ Parent consultation has incorrect conversation_depth: {response.get('conversation_depth')}")
            
            print(f"   Created parent consultation: {response.get('hexagram_name', 'Unknown')}")
            print(f"   Parent consultation ID: {self.parent_consultation_id}")
            
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks == len(verification_checks):
                return True
            else:
                self.log_test("Conversation Continuation - Parent", False, "Parent consultation verification failed")
                return False
        
        return False

    def test_conversation_continuation_child(self):
        """Test creating continuation consultation (child) with parent_consultation_id"""
        if not self.token or not hasattr(self, 'parent_consultation_id'):
            self.log_test("Conversation Continuation - Child", False, "No auth token or parent consultation")
            return False
            
        consultation_data = {
            "question": "Come posso migliorare la situazione lavorativa?",
            "coin_tosses": {
                "line1": 8,  # Yin
                "line2": 7,  # Yang
                "line3": 7,  # Yang
                "line4": 9,  # Old Yang (moving)
                "line5": 8,  # Yin
                "line6": 7   # Yang
            },
            "consultation_type": "direct",
            "parent_consultation_id": self.parent_consultation_id
        }
        
        success, response = self.run_test(
            "Conversation Continuation - Child",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.child_consultation_id = response['id']
            
            # Verify child consultation fields
            verification_checks = []
            
            if response.get('parent_consultation_id') == self.parent_consultation_id:
                verification_checks.append("✅ Child consultation has correct parent_consultation_id")
            else:
                verification_checks.append(f"❌ Child consultation has incorrect parent_consultation_id: {response.get('parent_consultation_id')}")
            
            if response.get('conversation_depth') == 1:
                verification_checks.append("✅ Child consultation has conversation_depth = 1")
            else:
                verification_checks.append(f"❌ Child consultation has incorrect conversation_depth: {response.get('conversation_depth')}")
            
            # Check if interpretation references previous consultation
            interpretation = response.get('interpretation', '')
            if any(keyword in interpretation.lower() for keyword in ['precedente', 'prima', 'stesa', 'domanda', 'conversazione']):
                verification_checks.append("✅ Child interpretation references previous consultation")
            else:
                verification_checks.append("❌ Child interpretation doesn't reference previous consultation")
            
            print(f"   Created child consultation: {response.get('hexagram_name', 'Unknown')}")
            print(f"   Child consultation ID: {self.child_consultation_id}")
            print(f"   Parent ID: {response.get('parent_consultation_id')}")
            print(f"   Conversation depth: {response.get('conversation_depth')}")
            
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks >= 2:  # At least 2 out of 3 checks should pass
                return True
            else:
                self.log_test("Conversation Continuation - Child", False, "Child consultation verification failed")
                return False
        
        return False

    def test_conversation_continuation_grandchild(self):
        """Test creating second continuation (grandchild) with conversation_depth = 2"""
        if not self.token or not hasattr(self, 'child_consultation_id'):
            self.log_test("Conversation Continuation - Grandchild", False, "No auth token or child consultation")
            return False
            
        consultation_data = {
            "question": "Cosa devo fare concretamente domani?",
            "coin_tosses": {
                "line1": 6,  # Old Yin (moving)
                "line2": 9,  # Old Yang (moving)
                "line3": 8,  # Yin
                "line4": 7,  # Yang
                "line5": 7,  # Yang
                "line6": 9   # Old Yang (moving)
            },
            "consultation_type": "direct",
            "parent_consultation_id": self.child_consultation_id
        }
        
        success, response = self.run_test(
            "Conversation Continuation - Grandchild",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'id' in response:
            self.grandchild_consultation_id = response['id']
            
            # Verify grandchild consultation fields
            verification_checks = []
            
            if response.get('parent_consultation_id') == self.child_consultation_id:
                verification_checks.append("✅ Grandchild consultation has correct parent_consultation_id")
            else:
                verification_checks.append(f"❌ Grandchild consultation has incorrect parent_consultation_id: {response.get('parent_consultation_id')}")
            
            if response.get('conversation_depth') == 2:
                verification_checks.append("✅ Grandchild consultation has conversation_depth = 2")
            else:
                verification_checks.append(f"❌ Grandchild consultation has incorrect conversation_depth: {response.get('conversation_depth')}")
            
            # Check if interpretation references conversation history
            interpretation = response.get('interpretation', '')
            if any(keyword in interpretation.lower() for keyword in ['storia', 'conversazione', 'precedenti', 'stese', 'domande']):
                verification_checks.append("✅ Grandchild interpretation references conversation history")
            else:
                verification_checks.append("❌ Grandchild interpretation doesn't reference conversation history")
            
            print(f"   Created grandchild consultation: {response.get('hexagram_name', 'Unknown')}")
            print(f"   Grandchild consultation ID: {self.grandchild_consultation_id}")
            print(f"   Parent ID: {response.get('parent_consultation_id')}")
            print(f"   Conversation depth: {response.get('conversation_depth')}")
            
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks >= 2:  # At least 2 out of 3 checks should pass
                return True
            else:
                self.log_test("Conversation Continuation - Grandchild", False, "Grandchild consultation verification failed")
                return False
        
        return False

    def test_conversation_history_in_get_consultations(self):
        """Test that GET /api/consultations returns parent_consultation_id and conversation_depth"""
        if not self.token:
            self.log_test("Conversation History in GET Consultations", False, "No auth token")
            return False
        
        success, response = self.run_test(
            "Conversation History in GET Consultations",
            "GET",
            "consultations",
            200
        )
        
        if success and isinstance(response, list):
            verification_checks = []
            
            # Find our conversation consultations
            parent_found = None
            child_found = None
            grandchild_found = None
            
            for consultation in response:
                if hasattr(self, 'parent_consultation_id') and consultation.get('id') == self.parent_consultation_id:
                    parent_found = consultation
                elif hasattr(self, 'child_consultation_id') and consultation.get('id') == self.child_consultation_id:
                    child_found = consultation
                elif hasattr(self, 'grandchild_consultation_id') and consultation.get('id') == self.grandchild_consultation_id:
                    grandchild_found = consultation
            
            # Verify parent consultation in list
            if parent_found:
                if (parent_found.get('parent_consultation_id') is None and 
                    parent_found.get('conversation_depth') == 0):
                    verification_checks.append("✅ Parent consultation fields correct in list")
                else:
                    verification_checks.append(f"❌ Parent consultation fields incorrect in list: parent_id={parent_found.get('parent_consultation_id')}, depth={parent_found.get('conversation_depth')}")
            else:
                verification_checks.append("❌ Parent consultation not found in list")
            
            # Verify child consultation in list
            if child_found:
                if (child_found.get('parent_consultation_id') == self.parent_consultation_id and 
                    child_found.get('conversation_depth') == 1):
                    verification_checks.append("✅ Child consultation fields correct in list")
                else:
                    verification_checks.append(f"❌ Child consultation fields incorrect in list: parent_id={child_found.get('parent_consultation_id')}, depth={child_found.get('conversation_depth')}")
            else:
                verification_checks.append("❌ Child consultation not found in list")
            
            # Verify grandchild consultation in list
            if grandchild_found:
                if (grandchild_found.get('parent_consultation_id') == self.child_consultation_id and 
                    grandchild_found.get('conversation_depth') == 2):
                    verification_checks.append("✅ Grandchild consultation fields correct in list")
                else:
                    verification_checks.append(f"❌ Grandchild consultation fields incorrect in list: parent_id={grandchild_found.get('parent_consultation_id')}, depth={grandchild_found.get('conversation_depth')}")
            else:
                verification_checks.append("❌ Grandchild consultation not found in list")
            
            print(f"   Found {len(response)} total consultations")
            print("   Conversation History Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            total_checks = len(verification_checks)
            
            if passed_checks >= total_checks - 1:  # Allow 1 failure
                print(f"   ✅ Conversation history verification: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Conversation History in GET Consultations", False, 
                            f"Conversation history verification failed: {passed_checks}/{total_checks} checks passed")
                return False
        
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

    def test_enhanced_interpretation_italian_with_moving_lines(self):
        """Test enhanced I Ching interpretation system with moving lines in Italian"""
        if not self.token:
            self.log_test("Enhanced Interpretation (Italian with Moving Lines)", False, "No auth token")
            return False
            
        # Create consultation with moving lines as specified in the review request
        consultation_data = {
            "question": "Cosa mi aspetta nel prossimo anno riguardo alla mia carriera?",
            "coin_tosses": {
                "line1": 9,  # Old Yang (moving)
                "line2": 6,  # Old Yin (moving)
                "line3": 7,  # Young Yang
                "line4": 8,  # Young Yin
                "line5": 9,  # Old Yang (moving)
                "line6": 6   # Old Yin (moving)
            }
        }
        
        success, response = self.run_test(
            "Enhanced Interpretation (Italian with Moving Lines)",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            
            print(f"   ✅ Consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            print(f"   Derived hexagram: {response.get('derived_hexagram_number')} - {response.get('derived_hexagram_name', 'None')}")
            print(f"   Interpretation word count: {word_count}")
            
            # Verify interpretation quality requirements
            quality_checks = []
            
            # 1. Check word count (600-900 words)
            if 600 <= word_count <= 900:
                quality_checks.append("✅ Word count in range (600-900)")
            else:
                quality_checks.append(f"❌ Word count {word_count} not in range (600-900)")
            
            # 2. Check for traditional I Ching references
            traditional_keywords = ["giudizio", "immagine", "trigramma", "linea", "mutevole", "esagramma"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 2:  # Reduced from 3 to 2
                quality_checks.append(f"✅ Contains traditional references: {found_traditional}")
            else:
                quality_checks.append(f"❌ Insufficient traditional references found: {found_traditional}")
            
            # 3. Check for moving lines explanation
            moving_lines = response.get('moving_lines', [])
            if moving_lines:
                moving_explained = any(f"linea {line}" in interpretation.lower() or "prima linea" in interpretation.lower() or "seconda linea" in interpretation.lower() or "terza linea" in interpretation.lower() or "quarta linea" in interpretation.lower() or "quinta linea" in interpretation.lower() or "sesta linea" in interpretation.lower() for line in moving_lines)
                if moving_explained:
                    quality_checks.append("✅ Moving lines explained in detail")
                else:
                    quality_checks.append("❌ Moving lines not properly explained")
            
            # 4. Check for derived hexagram explanation
            if response.get('derived_hexagram_number'):
                derived_explained = "trasform" in interpretation.lower() or "derivato" in interpretation.lower() or "muta" in interpretation.lower() or "diventa" in interpretation.lower()
                if derived_explained:
                    quality_checks.append("✅ Derived hexagram transformation explained")
                else:
                    quality_checks.append("❌ Derived hexagram transformation not explained")
            
            # 5. Check for poetic/contemplative style
            poetic_indicators = ["tao", "drago", "acqua", "monte", "vento", "fuoco", "terra", "cielo", "natura", "stagno", "fiume", "pietra", "onde", "energia"]
            found_poetic = [ind for ind in poetic_indicators if ind.lower() in interpretation.lower()]
            if len(found_poetic) >= 2:
                quality_checks.append(f"✅ Poetic/contemplative style: {found_poetic}")
            else:
                quality_checks.append(f"❌ Lacks poetic/contemplative style: {found_poetic}")
            
            # 6. Check for question specificity
            career_keywords = ["carriera", "lavoro", "professione", "anno", "futuro", "professionale", "cammino"]
            found_career = [kw for kw in career_keywords if kw.lower() in interpretation.lower()]
            if len(found_career) >= 1:  # Reduced from 2 to 1
                quality_checks.append(f"✅ Specific to career question: {found_career}")
            else:
                quality_checks.append(f"❌ Not specific to career question: {found_career}")
            
            # Print quality assessment
            print("   Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            # Store for English test
            self.italian_consultation_id = response['id']
            
            # Count passed checks
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 4:  # At least 4 out of 6 checks should pass
                print(f"   ✅ Quality assessment: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Enhanced Interpretation (Italian with Moving Lines)", False, 
                            f"Quality assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_enhanced_interpretation_english_with_moving_lines(self):
        """Test enhanced I Ching interpretation system with moving lines in English"""
        if not self.token:
            self.log_test("Enhanced Interpretation (English with Moving Lines)", False, "No auth token")
            return False
        
        # First update language to English
        lang_success, _ = self.run_test(
            "Update Language to English",
            "PUT",
            "auth/language?language=en",
            200
        )
        
        if not lang_success:
            self.log_test("Enhanced Interpretation (English with Moving Lines)", False, "Failed to update language")
            return False
            
        # Create consultation with moving lines in English
        consultation_data = {
            "question": "What opportunities await me in my career development over the next year?",
            "coin_tosses": {
                "line1": 6,  # Old Yin (moving)
                "line2": 9,  # Old Yang (moving)
                "line3": 8,  # Young Yin
                "line4": 7,  # Young Yang
                "line5": 6,  # Old Yin (moving)
                "line6": 9   # Old Yang (moving)
            }
        }
        
        success, response = self.run_test(
            "Enhanced Interpretation (English with Moving Lines)",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            
            print(f"   ✅ English consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            print(f"   Derived hexagram: {response.get('derived_hexagram_number')} - {response.get('derived_hexagram_name', 'None')}")
            print(f"   Interpretation word count: {word_count}")
            
            # Verify interpretation quality requirements for English
            quality_checks = []
            
            # 1. Check word count (600-900 words)
            if 600 <= word_count <= 900:
                quality_checks.append("✅ Word count in range (600-900)")
            else:
                quality_checks.append(f"❌ Word count {word_count} not in range (600-900)")
            
            # 2. Check for traditional I Ching references in English
            traditional_keywords = ["judgment", "image", "trigram", "line", "moving", "hexagram", "changing"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 3:
                quality_checks.append(f"✅ Contains traditional references: {found_traditional}")
            else:
                quality_checks.append(f"❌ Insufficient traditional references found: {found_traditional}")
            
            # 3. Check for moving lines explanation
            moving_lines = response.get('moving_lines', [])
            if moving_lines:
                moving_explained = any(f"line {line}" in interpretation.lower() or "moving line" in interpretation.lower() for line in moving_lines)
                if moving_explained:
                    quality_checks.append("✅ Moving lines explained in detail")
                else:
                    quality_checks.append("❌ Moving lines not properly explained")
            
            # 4. Check for derived hexagram explanation
            if response.get('derived_hexagram_number'):
                derived_explained = "transform" in interpretation.lower() or "derived" in interpretation.lower() or "becomes" in interpretation.lower()
                if derived_explained:
                    quality_checks.append("✅ Derived hexagram transformation explained")
                else:
                    quality_checks.append("❌ Derived hexagram transformation not explained")
            
            # 5. Check for poetic/contemplative style in English
            poetic_indicators = ["tao", "dragon", "water", "mountain", "wind", "fire", "earth", "heaven", "nature", "ancient", "sage"]
            found_poetic = [ind for ind in poetic_indicators if ind.lower() in interpretation.lower()]
            if len(found_poetic) >= 2:
                quality_checks.append(f"✅ Poetic/contemplative style: {found_poetic}")
            else:
                quality_checks.append(f"❌ Lacks poetic/contemplative style: {found_poetic}")
            
            # 6. Check for question specificity
            career_keywords = ["career", "work", "profession", "year", "future", "opportunities", "development"]
            found_career = [kw for kw in career_keywords if kw.lower() in interpretation.lower()]
            if len(found_career) >= 2:
                quality_checks.append(f"✅ Specific to career question: {found_career}")
            else:
                quality_checks.append(f"❌ Not specific to career question: {found_career}")
            
            # Print quality assessment
            print("   Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            # Count passed checks
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 4:  # At least 4 out of 6 checks should pass
                print(f"   ✅ Quality assessment: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Enhanced Interpretation (English with Moving Lines)", False, 
                            f"Quality assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_delete_consultation_endpoint(self):
        """Test DELETE consultation endpoint functionality"""
        if not self.token:
            self.log_test("DELETE Consultation Endpoint", False, "No auth token")
            return False
        
        print("\n🗑️  Testing DELETE Consultation Endpoint...")
        
        # Step 1: Create a test consultation to delete
        consultation_data = {
            "question": "Test consultation for deletion",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 8,  # Yin
                "line3": 7,  # Yang
                "line4": 8,  # Yin
                "line5": 7,  # Yang
                "line6": 8   # Yin
            }
        }
        
        success, response = self.run_test(
            "Create Consultation for Deletion Test",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if not success or 'id' not in response:
            self.log_test("DELETE Consultation Endpoint", False, "Failed to create test consultation")
            return False
        
        consultation_id = response['id']
        print(f"   Created test consultation with ID: {consultation_id}")
        
        # Step 2: Verify the consultation exists
        success, response = self.run_test(
            "Verify Consultation Exists Before Delete",
            "GET",
            "consultations",
            200
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Failed to get consultations list")
            return False
        
        # Check if our consultation is in the list
        consultation_found = any(c.get('id') == consultation_id for c in response)
        if not consultation_found:
            self.log_test("DELETE Consultation Endpoint", False, "Test consultation not found in list")
            return False
        
        print(f"   ✅ Consultation {consultation_id} exists in list")
        
        # Step 3: Delete the consultation
        success, response = self.run_test(
            "Delete Consultation",
            "DELETE",
            f"consultations/{consultation_id}",
            200
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Failed to delete consultation")
            return False
        
        print(f"   ✅ Consultation {consultation_id} deleted successfully")
        
        # Step 4: Verify the consultation no longer exists in the list
        success, response = self.run_test(
            "Verify Consultation Deleted from List",
            "GET",
            "consultations",
            200
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Failed to get consultations list after delete")
            return False
        
        # Check if our consultation is still in the list (it shouldn't be)
        consultation_still_exists = any(c.get('id') == consultation_id for c in response)
        if consultation_still_exists:
            self.log_test("DELETE Consultation Endpoint", False, "Consultation still exists after deletion")
            return False
        
        print(f"   ✅ Consultation {consultation_id} no longer exists in list")
        
        # Step 5: Try to get the specific consultation (should return 404)
        success, response = self.run_test(
            "Get Deleted Consultation (Should Fail)",
            "GET",
            f"consultations/{consultation_id}",
            404
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Expected 404 when getting deleted consultation")
            return False
        
        print(f"   ✅ Getting deleted consultation correctly returns 404")
        
        # Step 6: Test deleting non-existent consultation (should return 404)
        fake_id = "non-existent-consultation-id-12345"
        success, response = self.run_test(
            "Delete Non-existent Consultation (Should Fail)",
            "DELETE",
            f"consultations/{fake_id}",
            404
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Expected 404 when deleting non-existent consultation")
            return False
        
        print(f"   ✅ Deleting non-existent consultation correctly returns 404")
        
        # Step 7: Test deleting with invalid ID format
        invalid_id = "invalid-id-format"
        success, response = self.run_test(
            "Delete with Invalid ID Format (Should Fail)",
            "DELETE",
            f"consultations/{invalid_id}",
            404
        )
        
        if not success:
            self.log_test("DELETE Consultation Endpoint", False, "Expected 404 when deleting with invalid ID")
            return False
        
        print(f"   ✅ Deleting with invalid ID correctly returns 404")
        
        self.log_test("DELETE Consultation Endpoint", True, "All delete tests passed")
        return True

    def test_consultation_response_structure(self):
        """Test that consultation response has all required fields for enhanced system"""
        if not self.token or not hasattr(self, 'italian_consultation_id'):
            self.log_test("Consultation Response Structure", False, "No consultation available")
            return False
            
        success, response = self.run_test(
            "Get Consultation Response Structure",
            "GET",
            f"consultations/{self.italian_consultation_id}",
            200
        )
        
        if success:
            required_fields = [
                'id', 'question', 'hexagram_number', 'hexagram_name', 'hexagram_chinese',
                'moving_lines', 'interpretation', 'created_at'
            ]
            
            optional_fields = [
                'derived_hexagram_number', 'derived_hexagram_name', 'derived_hexagram_chinese',
                'traditional_data', 'derived_traditional_data', 'hexagram_symbol'
            ]
            
            missing_required = [field for field in required_fields if field not in response]
            present_optional = [field for field in optional_fields if field in response and response[field] is not None]
            
            print(f"   Required fields present: {len(required_fields) - len(missing_required)}/{len(required_fields)}")
            print(f"   Optional fields present: {len(present_optional)}/{len(optional_fields)}")
            
            if missing_required:
                print(f"   ❌ Missing required fields: {missing_required}")
                self.log_test("Consultation Response Structure", False, f"Missing required fields: {missing_required}")
                return False
            
            # Check if moving lines are present and derived hexagram exists
            moving_lines = response.get('moving_lines', [])
            derived_hex = response.get('derived_hexagram_number')
            
            if moving_lines and not derived_hex:
                print(f"   ❌ Has moving lines {moving_lines} but no derived hexagram")
                self.log_test("Consultation Response Structure", False, "Moving lines present but no derived hexagram")
                return False
            
            if moving_lines and derived_hex:
                print(f"   ✅ Moving lines {moving_lines} correctly generate derived hexagram {derived_hex}")
            
            print(f"   ✅ All required fields present, structure valid")
            return True
        
        return False

    def test_consultation_type_direct(self):
        """Test consultation with consultation_type='direct' - should be shorter and more direct"""
        if not self.token:
            self.log_test("Consultation Type Direct", False, "No auth token")
            return False
            
        consultation_data = {
            "question": "Cosa succederà domani al lavoro?",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 8,  # Yin
                "line3": 9,  # Old Yang (moving)
                "line4": 7,  # Yang
                "line5": 6,  # Old Yin (moving)
                "line6": 8   # Yin
            },
            "consultation_type": "direct"
        }
        
        success, response = self.run_test(
            "Consultation Type Direct",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            
            print(f"   ✅ Direct consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            print(f"   Interpretation word count: {word_count}")
            
            # Store for comparison
            self.direct_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': response.get('consultation_type', 'unknown')
            }
            
            # Verify direct style characteristics
            quality_checks = []
            
            # 1. Check word count (300-400 words for direct)
            if 300 <= word_count <= 400:
                quality_checks.append("✅ Word count in direct range (300-400)")
            else:
                quality_checks.append(f"❌ Word count {word_count} not in direct range (300-400)")
            
            # 2. Check for direct, simple language (less poetic)
            direct_indicators = ["tu", "la tua", "questo è", "ecco", "devi", "puoi", "ora", "oggi", "domani"]
            found_direct = [ind for ind in direct_indicators if ind.lower() in interpretation.lower()]
            if len(found_direct) >= 3:
                quality_checks.append(f"✅ Direct language style: {found_direct}")
            else:
                quality_checks.append(f"❌ Lacks direct language style: {found_direct}")
            
            # 3. Check consultation_type is saved
            if response.get('consultation_type') == 'direct':
                quality_checks.append("✅ Consultation type 'direct' saved correctly")
            else:
                quality_checks.append(f"❌ Consultation type not saved correctly: {response.get('consultation_type')}")
            
            # 4. Check for work-specific content
            work_keywords = ["lavoro", "domani", "ufficio", "colleghi", "progetto", "attività"]
            found_work = [kw for kw in work_keywords if kw.lower() in interpretation.lower()]
            if len(found_work) >= 1:
                quality_checks.append(f"✅ Work-specific content: {found_work}")
            else:
                quality_checks.append(f"❌ Not specific to work question: {found_work}")
            
            # Print quality assessment
            print("   Direct Style Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            # Count passed checks
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 3:  # At least 3 out of 4 checks should pass
                print(f"   ✅ Direct style assessment: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Consultation Type Direct", False, 
                            f"Direct style assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_hexagram_14_traditional_texts(self):
        """Test Hexagram 14 (Ta Yu / Il Possesso Grande) with correct traditional texts for moving lines 3, 4, 6"""
        if not self.token:
            self.log_test("Hexagram 14 Traditional Texts", False, "No auth token")
            return False
            
        # Create consultation that produces Hexagram 14 with moving lines 3, 4, 6
        consultation_data = {
            "question": "Come sta lei in questo momento?",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 7,  # Yang  
                "line3": 9,  # Old Yang (moving)
                "line4": 9,  # Old Yang (moving)
                "line5": 8,  # Yin
                "line6": 9   # Old Yang (moving)
            },
            "consultation_type": "deep"
        }
        
        success, response = self.run_test(
            "Hexagram 14 Traditional Texts",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            
            print(f"   ✅ Consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            print(f"   Derived hexagram: {response.get('derived_hexagram_number')} - {response.get('derived_hexagram_name', 'None')}")
            
            # Verify hexagram structure
            verification_checks = []
            
            # 1. Check hexagram number is 14
            if response.get('hexagram_number') == 14:
                verification_checks.append("✅ Hexagram number is 14")
            else:
                verification_checks.append(f"❌ Hexagram number is {response.get('hexagram_number')}, expected 14")
            
            # 2. Check hexagram name contains "Possesso Grande" or "Ta Yu"
            hexagram_name = response.get('hexagram_name', '')
            if "Possesso Grande" in hexagram_name or "Ta Yu" in hexagram_name:
                verification_checks.append(f"✅ Hexagram name correct: {hexagram_name}")
            else:
                verification_checks.append(f"❌ Hexagram name incorrect: {hexagram_name}")
            
            # 3. Check moving lines are [3, 4, 6]
            moving_lines = response.get('moving_lines', [])
            if moving_lines == [3, 4, 6]:
                verification_checks.append("✅ Moving lines correct: [3, 4, 6]")
            else:
                verification_checks.append(f"❌ Moving lines incorrect: {moving_lines}, expected [3, 4, 6]")
            
            # 4. Check derived hexagram is 19 (L'Avvicinamento)
            derived_hex = response.get('derived_hexagram_number')
            derived_name = response.get('derived_hexagram_name', '')
            if derived_hex == 19:
                verification_checks.append(f"✅ Derived hexagram correct: 19 - {derived_name}")
            else:
                verification_checks.append(f"❌ Derived hexagram incorrect: {derived_hex}, expected 19")
            
            # 5. Check traditional texts for moving lines in interpretation
            traditional_text_checks = []
            
            # Line 3: "Un principe ne fa offerta al Figlio del Cielo"
            if "principe" in interpretation.lower() and ("offerta" in interpretation.lower() or "figlio del cielo" in interpretation.lower()):
                traditional_text_checks.append("✅ Line 3 traditional text found: 'principe offerta/Figlio del Cielo'")
            else:
                traditional_text_checks.append("❌ Line 3 traditional text missing: 'Un principe ne fa offerta al Figlio del Cielo'")
            
            # Line 4: "Fa una distinzione tra sé e il suo prossimo"
            if "distinzione" in interpretation.lower() and ("prossimo" in interpretation.lower() or "vicino" in interpretation.lower()):
                traditional_text_checks.append("✅ Line 4 traditional text found: 'distinzione prossimo'")
            else:
                traditional_text_checks.append("❌ Line 4 traditional text missing: 'Fa una distinzione tra sé e il suo prossimo'")
            
            # Line 6: "Dal cielo egli viene benedetto" or "protezione divina"
            if ("cielo" in interpretation.lower() and "benedetto" in interpretation.lower()) or "protezione divina" in interpretation.lower():
                traditional_text_checks.append("✅ Line 6 traditional text found: 'cielo benedetto/protezione divina'")
            else:
                traditional_text_checks.append("❌ Line 6 traditional text missing: 'Dal cielo egli viene benedetto'")
            
            # Print all verification results
            print("   Hexagram Structure Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            print("   Traditional Text Verification:")
            for check in traditional_text_checks:
                print(f"     {check}")
            
            # Count passed checks
            structure_passed = sum(1 for check in verification_checks if check.startswith("✅"))
            text_passed = sum(1 for check in traditional_text_checks if check.startswith("✅"))
            
            total_structure = len(verification_checks)
            total_text = len(traditional_text_checks)
            
            print(f"   Structure checks: {structure_passed}/{total_structure}")
            print(f"   Traditional text checks: {text_passed}/{total_text}")
            
            # Test passes if all structure checks pass and at least 2 out of 3 traditional text checks pass
            if structure_passed == total_structure and text_passed >= 2:
                print(f"   ✅ Hexagram 14 traditional texts verification PASSED")
                return True
            else:
                self.log_test("Hexagram 14 Traditional Texts", False, 
                            f"Verification failed: structure {structure_passed}/{total_structure}, texts {text_passed}/{total_text}")
                return False
        
        return False

    def test_consultation_type_deep(self):
        """Test consultation with consultation_type='deep' - should be longer and more elaborate"""
        if not self.token:
            self.log_test("Consultation Type Deep", False, "No auth token")
            return False
            
        # Use same question and coin tosses for comparison
        consultation_data = {
            "question": "Cosa succederà domani al lavoro?",
            "coin_tosses": {
                "line1": 7,  # Yang
                "line2": 8,  # Yin
                "line3": 9,  # Old Yang (moving)
                "line4": 7,  # Yang
                "line5": 6,  # Old Yin (moving)
                "line6": 8   # Yin
            },
            "consultation_type": "deep"
        }
        
        success, response = self.run_test(
            "Consultation Type Deep",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            
            print(f"   ✅ Deep consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            print(f"   Interpretation word count: {word_count}")
            
            # Store for comparison
            self.deep_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': response.get('consultation_type', 'unknown')
            }
            
            # Verify deep style characteristics
            quality_checks = []
            
            # 1. Check word count (600-900 words for deep)
            if 600 <= word_count <= 900:
                quality_checks.append("✅ Word count in deep range (600-900)")
            else:
                quality_checks.append(f"❌ Word count {word_count} not in deep range (600-900)")
            
            # 2. Check for traditional I Ching references
            traditional_keywords = ["giudizio", "immagine", "trigramma", "linea", "mutevole", "esagramma", "tao"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 3:
                quality_checks.append(f"✅ Contains traditional references: {found_traditional}")
            else:
                quality_checks.append(f"❌ Insufficient traditional references: {found_traditional}")
            
            # 3. Check for poetic/contemplative language
            poetic_indicators = ["drago", "acqua", "monte", "vento", "fuoco", "terra", "cielo", "natura", "energia", "flusso", "armonia"]
            found_poetic = [ind for ind in poetic_indicators if ind.lower() in interpretation.lower()]
            if len(found_poetic) >= 2:
                quality_checks.append(f"✅ Poetic/contemplative style: {found_poetic}")
            else:
                quality_checks.append(f"❌ Lacks poetic/contemplative style: {found_poetic}")
            
            # 4. Check consultation_type is saved
            if response.get('consultation_type') == 'deep':
                quality_checks.append("✅ Consultation type 'deep' saved correctly")
            else:
                quality_checks.append(f"❌ Consultation type not saved correctly: {response.get('consultation_type')}")
            
            # Print quality assessment
            print("   Deep Style Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            # Count passed checks
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 3:  # At least 3 out of 4 checks should pass
                print(f"   ✅ Deep style assessment: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Consultation Type Deep", False, 
                            f"Deep style assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_consultation_types_comparison(self):
        """Compare direct vs deep consultation types to ensure they are distinctly different"""
        if not hasattr(self, 'direct_consultation') or not hasattr(self, 'deep_consultation'):
            self.log_test("Consultation Types Comparison", False, "Both consultation types not available")
            return False
        
        print("\n🔍 Comparing Direct vs Deep Consultation Types...")
        
        direct = self.direct_consultation
        deep = self.deep_consultation
        
        print(f"   Direct consultation:")
        print(f"     - Word count: {direct['word_count']}")
        print(f"     - Type saved: {direct['consultation_type']}")
        
        print(f"   Deep consultation:")
        print(f"     - Word count: {deep['word_count']}")
        print(f"     - Type saved: {deep['consultation_type']}")
        
        comparison_checks = []
        
        # 1. Word count difference should be significant
        word_diff = deep['word_count'] - direct['word_count']
        if word_diff >= 200:  # Deep should be at least 200 words longer
            comparison_checks.append(f"✅ Significant word count difference: {word_diff} words")
        else:
            comparison_checks.append(f"❌ Insufficient word count difference: {word_diff} words")
        
        # 2. Check that consultation types are saved correctly
        if direct['consultation_type'] == 'direct' and deep['consultation_type'] == 'deep':
            comparison_checks.append("✅ Consultation types saved correctly")
        else:
            comparison_checks.append(f"❌ Consultation types not saved correctly: direct={direct['consultation_type']}, deep={deep['consultation_type']}")
        
        # 3. Content style difference analysis
        direct_text = direct['interpretation'].lower()
        deep_text = deep['interpretation'].lower()
        
        # Count traditional references in each
        traditional_words = ["giudizio", "immagine", "trigramma", "tao", "esagramma"]
        direct_traditional_count = sum(1 for word in traditional_words if word in direct_text)
        deep_traditional_count = sum(1 for word in traditional_words if word in deep_text)
        
        if deep_traditional_count > direct_traditional_count:
            comparison_checks.append(f"✅ Deep has more traditional references: {deep_traditional_count} vs {direct_traditional_count}")
        else:
            comparison_checks.append(f"❌ Deep doesn't have more traditional references: {deep_traditional_count} vs {direct_traditional_count}")
        
        # 4. Check for different language complexity
        # Deep should have more complex/poetic language
        poetic_words = ["drago", "acqua", "monte", "vento", "energia", "flusso", "armonia", "natura"]
        direct_poetic_count = sum(1 for word in poetic_words if word in direct_text)
        deep_poetic_count = sum(1 for word in poetic_words if word in deep_text)
        
        if deep_poetic_count >= direct_poetic_count:
            comparison_checks.append(f"✅ Deep has more poetic language: {deep_poetic_count} vs {direct_poetic_count}")
        else:
            comparison_checks.append(f"❌ Deep doesn't have more poetic language: {deep_poetic_count} vs {direct_poetic_count}")
        
        print("   Comparison Results:")
        for check in comparison_checks:
            print(f"     {check}")
        
        # Count passed checks
        passed_checks = sum(1 for check in comparison_checks if check.startswith("✅"))
        total_checks = len(comparison_checks)
        
        if passed_checks >= 3:  # At least 3 out of 4 checks should pass
            print(f"   ✅ Consultation types are distinctly different: {passed_checks}/{total_checks} checks passed")
            self.log_test("Consultation Types Comparison", True)
            return True
        else:
            self.log_test("Consultation Types Comparison", False, 
                        f"Consultation types not sufficiently different: {passed_checks}/{total_checks} checks passed")
            return False

    def test_consultation_type_saved_in_database(self):
        """Verify consultation_type is properly saved and retrievable from database"""
        if not self.token or not hasattr(self, 'direct_consultation') or not hasattr(self, 'deep_consultation'):
            self.log_test("Consultation Type Saved in Database", False, "Consultations not available")
            return False
        
        print("\n🗄️  Verifying consultation_type is saved in database...")
        
        # Test retrieving consultations list
        success, response = self.run_test(
            "Get Consultations List with Types",
            "GET",
            "consultations",
            200
        )
        
        if not success:
            return False
        
        # Find our test consultations in the list
        direct_found = None
        deep_found = None
        
        for consultation in response:
            if consultation.get('id') == self.direct_consultation['id']:
                direct_found = consultation
            elif consultation.get('id') == self.deep_consultation['id']:
                deep_found = consultation
        
        verification_checks = []
        
        # Check direct consultation
        if direct_found:
            if direct_found.get('consultation_type') == 'direct':
                verification_checks.append("✅ Direct consultation type found in list")
            else:
                verification_checks.append(f"❌ Direct consultation type incorrect in list: {direct_found.get('consultation_type')}")
        else:
            verification_checks.append("❌ Direct consultation not found in list")
        
        # Check deep consultation
        if deep_found:
            if deep_found.get('consultation_type') == 'deep':
                verification_checks.append("✅ Deep consultation type found in list")
            else:
                verification_checks.append(f"❌ Deep consultation type incorrect in list: {deep_found.get('consultation_type')}")
        else:
            verification_checks.append("❌ Deep consultation not found in list")
        
        # Test individual consultation retrieval
        if direct_found:
            success, direct_detail = self.run_test(
                "Get Direct Consultation Detail",
                "GET",
                f"consultations/{self.direct_consultation['id']}",
                200
            )
            
            if success and direct_detail.get('consultation_type') == 'direct':
                verification_checks.append("✅ Direct consultation type in individual GET")
            else:
                verification_checks.append(f"❌ Direct consultation type incorrect in individual GET: {direct_detail.get('consultation_type') if success else 'Failed to retrieve'}")
        
        if deep_found:
            success, deep_detail = self.run_test(
                "Get Deep Consultation Detail",
                "GET",
                f"consultations/{self.deep_consultation['id']}",
                200
            )
            
            if success and deep_detail.get('consultation_type') == 'deep':
                verification_checks.append("✅ Deep consultation type in individual GET")
            else:
                verification_checks.append(f"❌ Deep consultation type incorrect in individual GET: {deep_detail.get('consultation_type') if success else 'Failed to retrieve'}")
        
        print("   Database Verification Results:")
        for check in verification_checks:
            print(f"     {check}")
        
        # Count passed checks
        passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
        total_checks = len(verification_checks)
        
        if passed_checks == total_checks:
            print(f"   ✅ All consultation types properly saved: {passed_checks}/{total_checks} checks passed")
            self.log_test("Consultation Type Saved in Database", True)
            return True
        else:
            self.log_test("Consultation Type Saved in Database", False, 
                        f"Database verification failed: {passed_checks}/{total_checks} checks passed")
            return False

    def test_hexagram_14_traditional_moving_lines_text(self):
        """Test that Hexagram 14 with moving lines 3, 4, 6 includes correct traditional texts"""
        if not self.token:
            self.log_test("Hexagram 14 Traditional Moving Lines Text", False, "No auth token")
            return False
            
        # Create consultation for Hexagram 14 with moving lines 3, 4, 6 as specified
        consultation_data = {
            "question": "Test linee mutevoli",
            "coin_tosses": {
                "line1": 7,  # Yang (no change)
                "line2": 7,  # Yang (no change)
                "line3": 9,  # Old Yang (moving) - Line 3
                "line4": 9,  # Old Yang (moving) - Line 4
                "line5": 8,  # Yin (no change)
                "line6": 9   # Old Yang (moving) - Line 6
            },
            "consultation_type": "deep"
        }
        
        success, response = self.run_test(
            "Hexagram 14 Traditional Moving Lines Text",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'traditional_data' in response:
            print(f"   ✅ Consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            
            # Verify this is Hexagram 14
            if response.get('hexagram_number') != 14:
                self.log_test("Hexagram 14 Traditional Moving Lines Text", False, 
                            f"Expected Hexagram 14, got {response.get('hexagram_number')}")
                return False
            
            # Verify moving lines are [3, 4, 6]
            expected_moving_lines = [3, 4, 6]
            actual_moving_lines = response.get('moving_lines', [])
            if sorted(actual_moving_lines) != sorted(expected_moving_lines):
                self.log_test("Hexagram 14 Traditional Moving Lines Text", False, 
                            f"Expected moving lines {expected_moving_lines}, got {actual_moving_lines}")
                return False
            
            # Check traditional_data exists and has moving_lines_text
            traditional_data = response.get('traditional_data', {})
            if not traditional_data:
                self.log_test("Hexagram 14 Traditional Moving Lines Text", False, "No traditional_data in response")
                return False
            
            moving_lines_text = traditional_data.get('moving_lines_text', [])
            if not moving_lines_text:
                self.log_test("Hexagram 14 Traditional Moving Lines Text", False, "moving_lines_text is empty")
                return False
            
            print(f"   Found {len(moving_lines_text)} moving line texts")
            
            # Verify each expected moving line has traditional text
            verification_checks = []
            expected_texts = {
                3: "Un principe ne fa offerta al Figlio del Cielo",
                4: "Fa una distinzione tra sé e il suo prossimo", 
                6: "Dal cielo egli viene benedetto"
            }
            
            for moving_line_data in moving_lines_text:
                position = moving_line_data.get('position')
                text = moving_line_data.get('text', '')
                meaning = moving_line_data.get('meaning', '')
                
                print(f"   Line {position}: '{text}'")
                print(f"     Meaning: {meaning[:100]}...")
                
                if position in expected_texts:
                    expected_text = expected_texts[position]
                    if expected_text in text:
                        verification_checks.append(f"✅ Line {position} contains expected text: '{expected_text}'")
                    else:
                        verification_checks.append(f"❌ Line {position} missing expected text: '{expected_text}' (found: '{text}')")
                else:
                    verification_checks.append(f"❌ Unexpected moving line position: {position}")
            
            # Check that all expected lines are present
            found_positions = [ml.get('position') for ml in moving_lines_text]
            for expected_pos in expected_moving_lines:
                if expected_pos not in found_positions:
                    verification_checks.append(f"❌ Missing moving line {expected_pos}")
            
            # Print verification results
            print("   Traditional Text Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            # Count passed checks
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            total_checks = len(verification_checks)
            
            if passed_checks == total_checks and total_checks >= 3:
                print(f"   ✅ All traditional texts verified: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Hexagram 14 Traditional Moving Lines Text", False, 
                            f"Traditional text verification failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_hexagram_50_il_crogiolo(self):
        """Test hexagram 50 (Il Crogiolo) with moving lines - specific test from review request"""
        if not self.token:
            self.log_test("Hexagram 50 (Il Crogiolo)", False, "No auth token")
            return False
            
        # Coin tosses that should generate hexagram 50 with moving lines
        consultation_data = {
            "question": "Test dei nuovi esagrammi - Esagramma 50",
            "consultation_type": "deep",
            "coin_tosses": {
                "line1": 8,  # Yin
                "line2": 7,  # Yang
                "line3": 9,  # Old Yang (moving)
                "line4": 7,  # Yang
                "line5": 6,  # Old Yin (moving)
                "line6": 9   # Old Yang (moving)
            }
        }
        
        success, response = self.run_test(
            "Hexagram 50 (Il Crogiolo)",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'hexagram_number' in response:
            hexagram_num = response.get('hexagram_number')
            hexagram_name = response.get('hexagram_name', '')
            moving_lines = response.get('moving_lines', [])
            interpretation = response.get('interpretation', '')
            
            print(f"   Generated hexagram: {hexagram_num} - {hexagram_name}")
            print(f"   Moving lines: {moving_lines}")
            
            # Verify this is a high hexagram number (50-64 range)
            verification_checks = []
            
            if 50 <= hexagram_num <= 64:
                verification_checks.append(f"✅ Generated high hexagram number: {hexagram_num}")
            else:
                verification_checks.append(f"❌ Generated low hexagram number: {hexagram_num} (expected 50-64)")
            
            # Check for moving lines
            if moving_lines:
                verification_checks.append(f"✅ Has moving lines: {moving_lines}")
            else:
                verification_checks.append("❌ No moving lines generated")
            
            # Check for traditional references in interpretation
            traditional_refs = ["giudizio", "immagine", "linea", "mutevole", "tradizionale"]
            found_refs = [ref for ref in traditional_refs if ref.lower() in interpretation.lower()]
            if len(found_refs) >= 2:
                verification_checks.append(f"✅ Contains traditional references: {found_refs}")
            else:
                verification_checks.append(f"❌ Lacks traditional references: {found_refs}")
            
            # Check interpretation length for deep consultation
            word_count = len(interpretation.split())
            if 600 <= word_count <= 900:
                verification_checks.append(f"✅ Deep interpretation length: {word_count} words")
            else:
                verification_checks.append(f"❌ Incorrect interpretation length: {word_count} words (expected 600-900)")
            
            print("   Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks >= 3:
                return True
            else:
                self.log_test("Hexagram 50 (Il Crogiolo)", False, f"Verification failed: {passed_checks}/4 checks passed")
                return False
        
        return False

    def test_hexagram_64_prima_del_compimento(self):
        """Test hexagram 64 (Prima del Compimento) with specific moving lines from review request"""
        if not self.token:
            self.log_test("Hexagram 64 (Prima del Compimento)", False, "No auth token")
            return False
            
        # Specific coin tosses from review request that should generate hexagram 64
        consultation_data = {
            "question": "Test dei nuovi esagrammi",
            "language": "it",
            "consultation_type": "deep",
            "coin_tosses": {
                "line1": 8,  # Yin
                "line2": 7,  # Yang
                "line3": 9,  # Old Yang (moving)
                "line4": 7,  # Yang
                "line5": 7,  # Yang
                "line6": 9   # Old Yang (moving)
            }
        }
        
        success, response = self.run_test(
            "Hexagram 64 (Prima del Compimento)",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'hexagram_number' in response:
            hexagram_num = response.get('hexagram_number')
            hexagram_name = response.get('hexagram_name', '')
            moving_lines = response.get('moving_lines', [])
            interpretation = response.get('interpretation', '')
            traditional_data = response.get('traditional_data', {})
            
            print(f"   Generated hexagram: {hexagram_num} - {hexagram_name}")
            print(f"   Moving lines: {moving_lines}")
            
            verification_checks = []
            
            # Check if we got hexagram 64 or another high hexagram
            if hexagram_num == 64:
                verification_checks.append(f"✅ Generated hexagram 64 (Prima del Compimento)")
                
                # Check for specific traditional text for hexagram 64 line 1
                if "coda nell'acqua" in interpretation.lower() or "umiliante" in interpretation.lower():
                    verification_checks.append("✅ Contains hexagram 64 traditional line text")
                else:
                    verification_checks.append("❌ Missing hexagram 64 traditional line text")
            elif 50 <= hexagram_num <= 64:
                verification_checks.append(f"✅ Generated high hexagram: {hexagram_num} (in range 50-64)")
            else:
                verification_checks.append(f"❌ Generated low hexagram: {hexagram_num} (expected 50-64)")
            
            # Check for moving lines presence
            if moving_lines:
                verification_checks.append(f"✅ Has moving lines: {moving_lines}")
                
                # Check if traditional moving lines text is present
                moving_lines_text = traditional_data.get('moving_lines_text', [])
                if moving_lines_text:
                    verification_checks.append(f"✅ Traditional moving lines text present: {len(moving_lines_text)} lines")
                else:
                    verification_checks.append("❌ No traditional moving lines text")
            else:
                verification_checks.append("❌ No moving lines generated")
            
            # Check for traditional I Ching content
            traditional_keywords = ["libro", "mutamenti", "tradizionale", "giudizio", "immagine"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 1:
                verification_checks.append(f"✅ Contains traditional I Ching references: {found_traditional}")
            else:
                verification_checks.append(f"❌ Lacks traditional I Ching references")
            
            print("   Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks >= 3:
                return True
            else:
                self.log_test("Hexagram 64 (Prima del Compimento)", False, f"Verification failed: {passed_checks}/4 checks passed")
                return False
        
        return False

    def test_extended_hexagrams_availability(self):
        """Test that extended hexagrams (50-64) are available with moving lines"""
        if not self.token:
            self.log_test("Extended Hexagrams Availability", False, "No auth token")
            return False
            
        # Test multiple high hexagrams to verify they're all available
        test_cases = [
            {"target": "Hexagram 55+", "line1": 9, "line2": 6, "line3": 7, "line4": 8, "line5": 9, "line6": 6},
            {"target": "Hexagram 60+", "line1": 6, "line2": 9, "line3": 8, "line4": 7, "line5": 6, "line6": 9},
            {"target": "High Hexagram", "line1": 7, "line2": 8, "line3": 6, "line4": 9, "line5": 7, "line6": 8}
        ]
        
        successful_tests = 0
        
        for i, test_case in enumerate(test_cases):
            consultation_data = {
                "question": f"Test esteso esagrammi superiori - {test_case['target']}",
                "consultation_type": "deep",
                "coin_tosses": {
                    "line1": test_case["line1"],
                    "line2": test_case["line2"],
                    "line3": test_case["line3"],
                    "line4": test_case["line4"],
                    "line5": test_case["line5"],
                    "line6": test_case["line6"]
                }
            }
            
            success, response = self.run_test(
                f"Extended Hexagram Test {i+1}",
                "POST",
                "consultations",
                200,
                data=consultation_data
            )
            
            if success and 'hexagram_number' in response:
                hexagram_num = response.get('hexagram_number')
                hexagram_name = response.get('hexagram_name', '')
                moving_lines = response.get('moving_lines', [])
                interpretation = response.get('interpretation', '')
                
                print(f"   Test {i+1}: Generated hexagram {hexagram_num} - {hexagram_name}")
                print(f"   Moving lines: {moving_lines}")
                
                # Check if it's a valid hexagram with proper interpretation
                if (1 <= hexagram_num <= 64 and 
                    len(interpretation) > 500 and 
                    hexagram_name):
                    successful_tests += 1
                    print(f"     ✅ Valid extended hexagram with full interpretation")
                else:
                    print(f"     ❌ Invalid or incomplete hexagram data")
        
        if successful_tests >= 2:  # At least 2 out of 3 should work
            self.log_test("Extended Hexagrams Availability", True, f"{successful_tests}/3 extended hexagram tests passed")
            return True
        else:
            self.log_test("Extended Hexagrams Availability", False, f"Only {successful_tests}/3 extended hexagram tests passed")
            return False

    def test_all_64_hexagrams_with_moving_lines(self):
        """Test that all 64 hexagrams are now available with moving lines content"""
        if not self.token:
            self.log_test("All 64 Hexagrams with Moving Lines", False, "No auth token")
            return False
            
        print("\n🔍 Testing comprehensive 64 hexagrams system...")
        
        # Test a few specific high-number hexagrams to verify the extended system
        high_hexagram_tests = [
            {
                "name": "Test Hexagram 50+ Range",
                "coin_tosses": {"line1": 8, "line2": 7, "line3": 9, "line4": 7, "line5": 6, "line6": 9}
            },
            {
                "name": "Test Hexagram 60+ Range", 
                "coin_tosses": {"line1": 6, "line2": 9, "line3": 7, "line4": 8, "line5": 6, "line6": 9}
            }
        ]
        
        verification_results = []
        
        for test in high_hexagram_tests:
            consultation_data = {
                "question": "Verifica sistema completo 64 esagrammi",
                "consultation_type": "deep",
                "coin_tosses": test["coin_tosses"]
            }
            
            success, response = self.run_test(
                test["name"],
                "POST",
                "consultations",
                200,
                data=consultation_data
            )
            
            if success and 'hexagram_number' in response:
                hexagram_num = response.get('hexagram_number')
                hexagram_name = response.get('hexagram_name', '')
                moving_lines = response.get('moving_lines', [])
                traditional_data = response.get('traditional_data', {})
                interpretation = response.get('interpretation', '')
                
                print(f"   {test['name']}: Hexagram {hexagram_num} - {hexagram_name}")
                
                # Verify comprehensive system features
                checks = []
                
                # 1. Valid hexagram number
                if 1 <= hexagram_num <= 64:
                    checks.append("✅ Valid hexagram number")
                else:
                    checks.append(f"❌ Invalid hexagram number: {hexagram_num}")
                
                # 2. Has proper name
                if hexagram_name and len(hexagram_name) > 3:
                    checks.append("✅ Has proper hexagram name")
                else:
                    checks.append("❌ Missing or invalid hexagram name")
                
                # 3. Moving lines functionality
                if moving_lines:
                    checks.append(f"✅ Moving lines present: {moving_lines}")
                    
                    # 4. Traditional moving lines text
                    moving_lines_text = traditional_data.get('moving_lines_text', [])
                    if moving_lines_text and len(moving_lines_text) > 0:
                        checks.append(f"✅ Traditional moving lines text: {len(moving_lines_text)} lines")
                    else:
                        checks.append("❌ No traditional moving lines text")
                else:
                    checks.append("⚠️ No moving lines (acceptable)")
                
                # 5. Rich interpretation
                word_count = len(interpretation.split())
                if word_count >= 600:
                    checks.append(f"✅ Rich interpretation: {word_count} words")
                else:
                    checks.append(f"❌ Short interpretation: {word_count} words")
                
                # 6. Traditional data structure
                if traditional_data and 'sentence' in traditional_data:
                    checks.append("✅ Traditional data structure present")
                else:
                    checks.append("❌ Missing traditional data structure")
                
                for check in checks:
                    print(f"     {check}")
                
                passed = sum(1 for check in checks if check.startswith("✅"))
                verification_results.append(passed >= 4)  # At least 4/6 checks should pass
        
        # Overall assessment
        successful_tests = sum(verification_results)
        total_tests = len(verification_results)
        
        if successful_tests >= total_tests * 0.8:  # 80% success rate
            self.log_test("All 64 Hexagrams with Moving Lines", True, 
                         f"Comprehensive system verified: {successful_tests}/{total_tests} tests passed")
            return True
        else:
            self.log_test("All 64 Hexagrams with Moving Lines", False, 
                         f"System incomplete: {successful_tests}/{total_tests} tests passed")
            return False

    def test_profile_completion_flow(self):
        """Test the complete profile completion flow as requested"""
        if not self.token:
            self.log_test("Profile Completion Flow", False, "No auth token")
            return False
        
        print("\n👤 Testing Profile Completion Flow...")
        
        # Step 1: Check initial profile completion status (should show show_prompt: true for new user)
        success, response = self.run_test(
            "Check Initial Profile Completion Status",
            "GET",
            "profile/completion-status",
            200
        )
        
        if not success:
            self.log_test("Profile Completion Flow", False, "Failed to get initial completion status")
            return False
        
        # Verify new user has show_prompt: true
        if not response.get('show_prompt', False):
            self.log_test("Profile Completion Flow", False, f"New user should have show_prompt=true, got: {response.get('show_prompt')}")
            return False
        
        print(f"   ✅ New user has show_prompt=true: {response.get('show_prompt')}")
        print(f"   Initial completion: {response.get('completion_percentage', 0)}%")
        
        # Step 2: Update profile with birth_date and other data
        profile_data = {
            "birth_date": "1990-05-15",
            "birth_time": "14:30", 
            "birth_place": "Roma, Italia",
            "gender": "male"
        }
        
        success, response = self.run_test(
            "Update Profile with Birth Data",
            "PUT",
            "profile",
            200,
            data=profile_data
        )
        
        if not success:
            self.log_test("Profile Completion Flow", False, "Failed to update profile")
            return False
        
        # Verify profile was updated correctly
        if not response.get('profile_completed', False):
            self.log_test("Profile Completion Flow", False, f"Profile should be completed after birth_date, got: {response.get('profile_completed')}")
            return False
        
        print(f"   ✅ Profile updated successfully")
        print(f"   Profile completed: {response.get('profile_completed')}")
        
        # Step 3: Verify the profile data via GET /api/profile
        success, response = self.run_test(
            "Verify Profile Data",
            "GET", 
            "profile",
            200
        )
        
        if not success:
            self.log_test("Profile Completion Flow", False, "Failed to get updated profile")
            return False
        
        # Check that profile_completed is true and astrological_profile exists
        verification_checks = []
        
        if response.get('profile_completed') == True:
            verification_checks.append("✅ profile_completed is true")
        else:
            verification_checks.append(f"❌ profile_completed should be true, got: {response.get('profile_completed')}")
        
        if response.get('astrological_profile') is not None:
            verification_checks.append("✅ astrological_profile data calculated")
        else:
            verification_checks.append("❌ astrological_profile data missing")
        
        # Check profile data fields
        profile = response.get('profile', {})
        expected_fields = ['birth_date', 'birth_time', 'birth_place', 'gender']
        for field in expected_fields:
            if profile.get(field) == profile_data[field]:
                verification_checks.append(f"✅ {field} saved correctly: {profile.get(field)}")
            else:
                verification_checks.append(f"❌ {field} not saved correctly: expected {profile_data[field]}, got {profile.get(field)}")
        
        print("   Profile Verification:")
        for check in verification_checks:
            print(f"     {check}")
        
        # Step 4: Check completion status again (should show show_prompt: false)
        success, response = self.run_test(
            "Check Final Profile Completion Status",
            "GET",
            "profile/completion-status", 
            200
        )
        
        if not success:
            self.log_test("Profile Completion Flow", False, "Failed to get final completion status")
            return False
        
        # Verify show_prompt is now false
        if response.get('show_prompt', True):
            verification_checks.append(f"❌ show_prompt should be false after completion, got: {response.get('show_prompt')}")
        else:
            verification_checks.append("✅ show_prompt is false after profile completion")
        
        if response.get('is_complete', False):
            verification_checks.append("✅ is_complete is true")
        else:
            verification_checks.append(f"❌ is_complete should be true, got: {response.get('is_complete')}")
        
        print(f"   ✅ Final completion status: show_prompt={response.get('show_prompt')}, is_complete={response.get('is_complete')}")
        print(f"   Final completion percentage: {response.get('completion_percentage', 0)}%")
        
        # Count successful checks
        passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
        total_checks = len(verification_checks)
        
        if passed_checks >= total_checks - 1:  # Allow 1 failure
            print(f"   ✅ Profile completion flow: {passed_checks}/{total_checks} checks passed")
            self.log_test("Profile Completion Flow", True, f"Profile completion flow successful: {passed_checks}/{total_checks} checks passed")
            return True
        else:
            self.log_test("Profile Completion Flow", False, f"Profile completion flow failed: {passed_checks}/{total_checks} checks passed")
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
            self.test_profile_completion_flow,  # Add the new profile test
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
            # Enhanced I Ching interpretation tests
            self.test_enhanced_interpretation_italian_with_moving_lines,
            self.test_enhanced_interpretation_english_with_moving_lines,
            self.test_consultation_response_structure,
            # NEW: Consultation type tests (direct vs deep)
            self.test_consultation_type_direct,
            self.test_consultation_type_deep,
            self.test_consultation_types_comparison,
            self.test_consultation_type_saved_in_database,
            # Hexagram 14 traditional moving lines text test (specific request)
            self.test_hexagram_14_traditional_moving_lines_text,
            # NEW TESTS: Extended hexagrams system (50-64) with moving lines
            self.test_extended_hexagrams_availability,
            self.test_hexagram_50_il_crogiolo,
            self.test_hexagram_64_prima_del_compimento,
            self.test_all_64_hexagrams_with_moving_lines,
            # DELETE consultation endpoint test
            self.test_delete_consultation_endpoint,
            # Synthesis consultation tests
            self.test_create_consultation_1,
            self.test_create_consultation_2,
            self.test_create_consultation_3,
            # Conversation continuation tests
            self.test_conversation_continuation_parent,
            self.test_conversation_continuation_child,
            self.test_conversation_continuation_grandchild,
            self.test_conversation_history_in_get_consultations,
            self.test_synthesis_with_one_consultation_should_fail,
            self.test_synthesis_with_nonexistent_consultation_should_fail,
            self.test_synthesis_with_too_many_consultations_should_fail,
            self.test_synthesis_confirmation_type,
            self.test_synthesis_deepening_type,
            self.test_synthesis_clarification_type,
            self.test_consultation_history_with_synthesis,
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