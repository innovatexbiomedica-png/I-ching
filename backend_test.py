import requests
import sys
import json
from datetime import datetime

class IChingAPITester:
    def __init__(self, base_url="https://iching-oracolo.preview.emergentagent.com/api"):
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
            "origin_url": "https://iching-oracolo.preview.emergentagent.com"
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

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting I Ching API Tests")
        print("=" * 50)
        
        # Test sequence
        tests = [
            self.test_user_registration,
            self.test_user_login,
            self.test_get_user_profile,
            self.test_language_update,
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