#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ConsultationTypesTester:
    def __init__(self, base_url="https://wellness-iching.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")

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

    def setup_user(self):
        """Create and login a test user"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_user = {
            "email": f"consultation_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Consultation Test User {timestamp}",
            "language": "it"
        }
        
        # Register
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user
        )
        
        if not success:
            return False
            
        # Login
        login_data = {
            "email": test_user['email'],
            "password": test_user['password']
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

    def test_consultation_type_direct(self):
        """Test consultation with consultation_type='direct'"""
        consultation_data = {
            "question": "Cosa succederà domani al lavoro?",
            "coin_tosses": {
                "line1": 7,
                "line2": 8,
                "line3": 9,
                "line4": 7,
                "line5": 6,
                "line6": 8
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
            consultation_type = response.get('consultation_type')
            
            print(f"   ✅ Direct consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Consultation type returned: {consultation_type}")
            print(f"   Interpretation word count: {word_count}")
            
            # Store for comparison
            self.direct_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': consultation_type
            }
            
            # Basic checks
            if consultation_type == 'direct':
                print(f"   ✅ Consultation type 'direct' saved and returned correctly")
                return True
            else:
                print(f"   ❌ Consultation type incorrect: expected 'direct', got '{consultation_type}'")
                return False
        
        return False

    def test_consultation_type_deep(self):
        """Test consultation with consultation_type='deep'"""
        consultation_data = {
            "question": "Cosa succederà domani al lavoro?",
            "coin_tosses": {
                "line1": 7,
                "line2": 8,
                "line3": 9,
                "line4": 7,
                "line5": 6,
                "line6": 8
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
            consultation_type = response.get('consultation_type')
            
            print(f"   ✅ Deep consultation created successfully")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Consultation type returned: {consultation_type}")
            print(f"   Interpretation word count: {word_count}")
            
            # Store for comparison
            self.deep_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': consultation_type
            }
            
            # Basic checks
            if consultation_type == 'deep':
                print(f"   ✅ Consultation type 'deep' saved and returned correctly")
                return True
            else:
                print(f"   ❌ Consultation type incorrect: expected 'deep', got '{consultation_type}'")
                return False
        
        return False

    def test_consultation_types_comparison(self):
        """Compare direct vs deep consultation types"""
        if not hasattr(self, 'direct_consultation') or not hasattr(self, 'deep_consultation'):
            self.log_test("Consultation Types Comparison", False, "Both consultation types not available")
            return False
        
        print("\n🔍 Comparing Direct vs Deep Consultation Types...")
        
        direct = self.direct_consultation
        deep = self.deep_consultation
        
        print(f"   Direct consultation:")
        print(f"     - Word count: {direct['word_count']}")
        print(f"     - Type: {direct['consultation_type']}")
        
        print(f"   Deep consultation:")
        print(f"     - Word count: {deep['word_count']}")
        print(f"     - Type: {deep['consultation_type']}")
        
        # Word count difference
        word_diff = deep['word_count'] - direct['word_count']
        print(f"   Word count difference: {word_diff} words")
        
        # Check that types are correct
        types_correct = (direct['consultation_type'] == 'direct' and 
                        deep['consultation_type'] == 'deep')
        
        if types_correct and word_diff > 0:
            print(f"   ✅ Consultation types are working correctly")
            self.log_test("Consultation Types Comparison", True)
            return True
        else:
            self.log_test("Consultation Types Comparison", False, 
                        f"Types correct: {types_correct}, Word diff: {word_diff}")
            return False

    def test_consultation_type_in_list(self):
        """Verify consultation_type appears in consultations list"""
        success, response = self.run_test(
            "Get Consultations List",
            "GET",
            "consultations",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} consultations")
            
            # Check if our consultations are in the list with correct types
            direct_found = False
            deep_found = False
            
            for consultation in response:
                if hasattr(self, 'direct_consultation') and consultation.get('id') == self.direct_consultation['id']:
                    if consultation.get('consultation_type') == 'direct':
                        direct_found = True
                        print(f"   ✅ Direct consultation found in list with correct type")
                    else:
                        print(f"   ❌ Direct consultation type incorrect in list: {consultation.get('consultation_type')}")
                
                if hasattr(self, 'deep_consultation') and consultation.get('id') == self.deep_consultation['id']:
                    if consultation.get('consultation_type') == 'deep':
                        deep_found = True
                        print(f"   ✅ Deep consultation found in list with correct type")
                    else:
                        print(f"   ❌ Deep consultation type incorrect in list: {consultation.get('consultation_type')}")
            
            if direct_found and deep_found:
                self.log_test("Consultation Type in List", True)
                return True
            else:
                self.log_test("Consultation Type in List", False, 
                            f"Direct found: {direct_found}, Deep found: {deep_found}")
                return False
        
        return False

    def run_all_tests(self):
        """Run all consultation type tests"""
        print("🚀 Starting Consultation Types Tests")
        print("=" * 50)
        
        if not self.setup_user():
            print("❌ Failed to setup test user")
            return 1
        
        tests = [
            self.test_consultation_type_direct,
            self.test_consultation_type_deep,
            self.test_consultation_types_comparison,
            self.test_consultation_type_in_list,
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
            print("🎉 All consultation type tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    tester = ConsultationTypesTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())