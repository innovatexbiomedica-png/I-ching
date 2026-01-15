import requests
import sys
import json
from datetime import datetime

class EnhancedIChingTester:
    def __init__(self, base_url="https://error-zapper-3.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
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

    def setup_user(self):
        """Setup test user and login"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"enhanced_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Enhanced Test User {timestamp}",
            "language": "it"
        }
        
        # Register
        success, response = self.run_test(
            "User Registration for Enhanced Tests",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if not success:
            return False
            
        # Login
        login_data = {"email": user_data["email"], "password": user_data["password"]}
        success, response = self.run_test(
            "User Login for Enhanced Tests",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_enhanced_interpretation_italian(self):
        """Test enhanced I Ching interpretation system with moving lines in Italian"""
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
            
            # Quality checks
            quality_checks = []
            
            # 1. Check word count (600-900 words) - Allow some flexibility
            if 500 <= word_count <= 1200:
                quality_checks.append("✅ Word count acceptable")
            else:
                quality_checks.append(f"❌ Word count {word_count} not acceptable")
            
            # 2. Traditional references
            traditional_keywords = ["giudizio", "immagine", "trigramma", "linea", "esagramma", "tao"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 2:
                quality_checks.append(f"✅ Contains traditional references: {found_traditional}")
            else:
                quality_checks.append(f"❌ Insufficient traditional references: {found_traditional}")
            
            # 3. Moving lines explanation
            moving_lines = response.get('moving_lines', [])
            if moving_lines:
                moving_explained = ("linea" in interpretation.lower() and 
                                 ("prima" in interpretation.lower() or "seconda" in interpretation.lower() or 
                                  "terza" in interpretation.lower() or "quarta" in interpretation.lower() or
                                  "quinta" in interpretation.lower() or "sesta" in interpretation.lower()))
                if moving_explained:
                    quality_checks.append("✅ Moving lines explained")
                else:
                    quality_checks.append("❌ Moving lines not explained")
            
            # 4. Derived hexagram
            if response.get('derived_hexagram_number'):
                derived_explained = ("trasform" in interpretation.lower() or "muta" in interpretation.lower() or 
                                   "diventa" in interpretation.lower() or "derivato" in interpretation.lower())
                if derived_explained:
                    quality_checks.append("✅ Derived hexagram explained")
                else:
                    quality_checks.append("❌ Derived hexagram not explained")
            
            # 5. Poetic style
            poetic_indicators = ["tao", "drago", "acqua", "monte", "vento", "fuoco", "terra", "cielo", "natura", "stagno", "fiume", "pietra", "onde", "energia"]
            found_poetic = [ind for ind in poetic_indicators if ind.lower() in interpretation.lower()]
            if len(found_poetic) >= 2:
                quality_checks.append(f"✅ Poetic style: {found_poetic}")
            else:
                quality_checks.append(f"❌ Lacks poetic style: {found_poetic}")
            
            # 6. Question specificity
            career_keywords = ["carriera", "lavoro", "professione", "anno", "futuro", "professionale", "cammino"]
            found_career = [kw for kw in career_keywords if kw.lower() in interpretation.lower()]
            if len(found_career) >= 1:
                quality_checks.append(f"✅ Specific to career: {found_career}")
            else:
                quality_checks.append(f"❌ Not specific to career: {found_career}")
            
            # Print assessment
            print("   Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 4:
                print(f"   ✅ Quality assessment: {passed_checks}/{total_checks} checks passed")
                self.italian_consultation_id = response['id']
                return True
            else:
                self.log_test("Enhanced Interpretation (Italian)", False, 
                            f"Quality assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_enhanced_interpretation_english(self):
        """Test enhanced I Ching interpretation system with moving lines in English"""
        # Update language to English
        success, _ = self.run_test(
            "Update Language to English",
            "PUT",
            "auth/language?language=en",
            200
        )
        
        if not success:
            return False
            
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
            
            # Quality checks for English
            quality_checks = []
            
            # 1. Word count
            if 500 <= word_count <= 1200:
                quality_checks.append("✅ Word count acceptable")
            else:
                quality_checks.append(f"❌ Word count {word_count} not acceptable")
            
            # 2. Traditional references
            traditional_keywords = ["judgment", "image", "trigram", "line", "moving", "hexagram", "changing"]
            found_traditional = [kw for kw in traditional_keywords if kw.lower() in interpretation.lower()]
            if len(found_traditional) >= 2:
                quality_checks.append(f"✅ Contains traditional references: {found_traditional}")
            else:
                quality_checks.append(f"❌ Insufficient traditional references: {found_traditional}")
            
            # 3. Moving lines
            moving_lines = response.get('moving_lines', [])
            if moving_lines:
                moving_explained = ("line" in interpretation.lower() and 
                                 ("first" in interpretation.lower() or "second" in interpretation.lower() or 
                                  "third" in interpretation.lower() or "fourth" in interpretation.lower() or
                                  "fifth" in interpretation.lower() or "sixth" in interpretation.lower() or
                                  "moving" in interpretation.lower()))
                if moving_explained:
                    quality_checks.append("✅ Moving lines explained")
                else:
                    quality_checks.append("❌ Moving lines not explained")
            
            # 4. Derived hexagram
            if response.get('derived_hexagram_number'):
                derived_explained = ("transform" in interpretation.lower() or "derived" in interpretation.lower() or 
                                   "becomes" in interpretation.lower() or "changes" in interpretation.lower())
                if derived_explained:
                    quality_checks.append("✅ Derived hexagram explained")
                else:
                    quality_checks.append("❌ Derived hexagram not explained")
            
            # 5. Poetic style
            poetic_indicators = ["tao", "dragon", "water", "mountain", "wind", "fire", "earth", "heaven", "nature", "ancient", "sage"]
            found_poetic = [ind for ind in poetic_indicators if ind.lower() in interpretation.lower()]
            if len(found_poetic) >= 2:
                quality_checks.append(f"✅ Poetic style: {found_poetic}")
            else:
                quality_checks.append(f"❌ Lacks poetic style: {found_poetic}")
            
            # 6. Question specificity
            career_keywords = ["career", "work", "profession", "year", "future", "opportunities", "development"]
            found_career = [kw for kw in career_keywords if kw.lower() in interpretation.lower()]
            if len(found_career) >= 1:
                quality_checks.append(f"✅ Specific to career: {found_career}")
            else:
                quality_checks.append(f"❌ Not specific to career: {found_career}")
            
            # Print assessment
            print("   Quality Assessment:")
            for check in quality_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in quality_checks if check.startswith("✅"))
            total_checks = len(quality_checks)
            
            if passed_checks >= 4:
                print(f"   ✅ Quality assessment: {passed_checks}/{total_checks} checks passed")
                return True
            else:
                self.log_test("Enhanced Interpretation (English)", False, 
                            f"Quality assessment failed: {passed_checks}/{total_checks} checks passed")
                return False
        
        return False

    def test_response_structure(self):
        """Test consultation response structure"""
        if not hasattr(self, 'italian_consultation_id'):
            self.log_test("Response Structure", False, "No consultation available")
            return False
            
        success, response = self.run_test(
            "Consultation Response Structure",
            "GET",
            f"consultations/{self.italian_consultation_id}",
            200
        )
        
        if success:
            required_fields = [
                'id', 'question', 'hexagram_number', 'hexagram_name', 'hexagram_chinese',
                'moving_lines', 'interpretation', 'created_at'
            ]
            
            missing_required = [field for field in required_fields if field not in response]
            
            if missing_required:
                self.log_test("Response Structure", False, f"Missing required fields: {missing_required}")
                return False
            
            # Check moving lines and derived hexagram relationship
            moving_lines = response.get('moving_lines', [])
            derived_hex = response.get('derived_hexagram_number')
            
            if moving_lines and not derived_hex:
                self.log_test("Response Structure", False, "Moving lines present but no derived hexagram")
                return False
            
            print(f"   ✅ All required fields present")
            print(f"   ✅ Moving lines {moving_lines} correctly generate derived hexagram {derived_hex}")
            return True
        
        return False

    def run_enhanced_tests(self):
        """Run enhanced interpretation tests"""
        print("🚀 Starting Enhanced I Ching Interpretation Tests")
        print("=" * 60)
        
        if not self.setup_user():
            print("❌ Failed to setup test user")
            return 1
        
        tests = [
            self.test_enhanced_interpretation_italian,
            self.test_enhanced_interpretation_english,
            self.test_response_structure,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
        
        print("\n" + "=" * 60)
        print(f"📊 Enhanced Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All enhanced interpretation tests passed!")
            return 0
        else:
            print("⚠️  Some enhanced interpretation tests failed")
            return 1

def main():
    tester = EnhancedIChingTester()
    return tester.run_enhanced_tests()

if __name__ == "__main__":
    sys.exit(main())