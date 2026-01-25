#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class ConsultationTypeReviewTester:
    def __init__(self, base_url="https://preview-sito.preview.emergentagent.com/api"):
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

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)

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
            "email": f"review_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Review Test User {timestamp}",
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

    def test_direct_consultation_as_specified(self):
        """Test POST /api/consultations with consultation_type='direct' as specified in review"""
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
            "POST /api/consultations with consultation_type='direct'",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            consultation_type = response.get('consultation_type')
            
            print(f"   Question: {response.get('question')}")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Consultation type: {consultation_type}")
            print(f"   Interpretation word count: {word_count}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            
            # Store for comparison
            self.direct_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': consultation_type,
                'response': response
            }
            
            # Verify requirements
            checks = []
            
            # 1. Word count should be 300-400 words (shorter)
            if 300 <= word_count <= 400:
                checks.append(f"✅ Word count in direct range: {word_count} words")
            else:
                checks.append(f"❌ Word count not in direct range (300-400): {word_count} words")
            
            # 2. Should be more direct and impactful
            direct_indicators = ["tu", "devi", "puoi", "ora", "oggi", "domani", "questo è", "ecco"]
            found_direct = sum(1 for indicator in direct_indicators if indicator.lower() in interpretation.lower())
            if found_direct >= 2:
                checks.append(f"✅ Direct language style detected: {found_direct} indicators")
            else:
                checks.append(f"❌ Lacks direct language style: {found_direct} indicators")
            
            # 3. Should use simple language (less complex words)
            simple_check = len([word for word in interpretation.split() if len(word) <= 6]) / len(interpretation.split())
            if simple_check >= 0.7:  # 70% of words should be 6 characters or less
                checks.append(f"✅ Simple language used: {simple_check:.1%} short words")
            else:
                checks.append(f"❌ Language too complex: {simple_check:.1%} short words")
            
            # 4. Consultation type should be saved
            if consultation_type == 'direct':
                checks.append("✅ Consultation type 'direct' saved correctly")
            else:
                checks.append(f"❌ Consultation type incorrect: {consultation_type}")
            
            print("   Direct Style Verification:")
            for check in checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in checks if check.startswith("✅"))
            if passed_checks >= 3:
                return True
            else:
                self.log_test("POST /api/consultations with consultation_type='direct'", False, 
                            f"Only {passed_checks}/4 checks passed")
                return False
        
        return False

    def test_deep_consultation_as_specified(self):
        """Test POST /api/consultations with consultation_type='deep' as specified in review"""
        # Use same question and coin tosses for comparison
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
            "POST /api/consultations with consultation_type='deep'",
            "POST",
            "consultations",
            200,
            data=consultation_data
        )
        
        if success and 'interpretation' in response:
            interpretation = response['interpretation']
            word_count = len(interpretation.split())
            consultation_type = response.get('consultation_type')
            
            print(f"   Question: {response.get('question')}")
            print(f"   Hexagram: {response.get('hexagram_number')} - {response.get('hexagram_name')}")
            print(f"   Consultation type: {consultation_type}")
            print(f"   Interpretation word count: {word_count}")
            print(f"   Moving lines: {response.get('moving_lines', [])}")
            
            # Store for comparison
            self.deep_consultation = {
                'id': response['id'],
                'interpretation': interpretation,
                'word_count': word_count,
                'consultation_type': consultation_type,
                'response': response
            }
            
            # Verify requirements
            checks = []
            
            # 1. Word count should be 600-900 words (longer)
            if 600 <= word_count <= 900:
                checks.append(f"✅ Word count in deep range: {word_count} words")
            else:
                checks.append(f"❌ Word count not in deep range (600-900): {word_count} words")
            
            # 2. Should be more elaborate with traditional quotes
            traditional_keywords = ["giudizio", "immagine", "trigramma", "tao", "esagramma", "linea", "mutevole"]
            found_traditional = sum(1 for keyword in traditional_keywords if keyword.lower() in interpretation.lower())
            if found_traditional >= 3:
                checks.append(f"✅ Traditional references found: {found_traditional} keywords")
            else:
                checks.append(f"❌ Insufficient traditional references: {found_traditional} keywords")
            
            # 3. Should use poetic/contemplative language
            poetic_keywords = ["drago", "acqua", "monte", "vento", "fuoco", "terra", "cielo", "natura", "energia", "flusso", "armonia", "saggezza"]
            found_poetic = sum(1 for keyword in poetic_keywords if keyword.lower() in interpretation.lower())
            if found_poetic >= 2:
                checks.append(f"✅ Poetic/contemplative language: {found_poetic} keywords")
            else:
                checks.append(f"❌ Lacks poetic/contemplative language: {found_poetic} keywords")
            
            # 4. Consultation type should be saved
            if consultation_type == 'deep':
                checks.append("✅ Consultation type 'deep' saved correctly")
            else:
                checks.append(f"❌ Consultation type incorrect: {consultation_type}")
            
            print("   Deep Style Verification:")
            for check in checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in checks if check.startswith("✅"))
            if passed_checks >= 3:
                return True
            else:
                self.log_test("POST /api/consultations with consultation_type='deep'", False, 
                            f"Only {passed_checks}/4 checks passed")
                return False
        
        return False

    def test_interpretations_are_distinctly_different(self):
        """Compare the two interpretations to ensure they are distinctly different in style"""
        if not hasattr(self, 'direct_consultation') or not hasattr(self, 'deep_consultation'):
            self.log_test("Compare Interpretations for Distinct Differences", False, "Both consultations not available")
            return False
        
        print("\n📊 Comparing Direct vs Deep Interpretations for Distinct Differences...")
        
        direct = self.direct_consultation
        deep = self.deep_consultation
        
        print(f"   Direct consultation:")
        print(f"     - Word count: {direct['word_count']}")
        print(f"     - Type: {direct['consultation_type']}")
        
        print(f"   Deep consultation:")
        print(f"     - Word count: {deep['word_count']}")
        print(f"     - Type: {deep['consultation_type']}")
        
        comparison_checks = []
        
        # 1. Significant word count difference
        word_diff = deep['word_count'] - direct['word_count']
        if word_diff >= 200:  # Deep should be at least 200 words longer
            comparison_checks.append(f"✅ Significant word count difference: {word_diff} words")
        else:
            comparison_checks.append(f"❌ Insufficient word count difference: {word_diff} words")
        
        # 2. Different style complexity
        direct_text = direct['interpretation'].lower()
        deep_text = deep['interpretation'].lower()
        
        # Count traditional I Ching terms
        traditional_terms = ["giudizio", "immagine", "trigramma", "tao", "esagramma"]
        direct_traditional = sum(1 for term in traditional_terms if term in direct_text)
        deep_traditional = sum(1 for term in traditional_terms if term in deep_text)
        
        if deep_traditional > direct_traditional:
            comparison_checks.append(f"✅ Deep has more traditional terms: {deep_traditional} vs {direct_traditional}")
        else:
            comparison_checks.append(f"❌ Deep doesn't have more traditional terms: {deep_traditional} vs {direct_traditional}")
        
        # 3. Different sentence complexity (average sentence length)
        direct_sentences = direct_text.count('.') + direct_text.count('!') + direct_text.count('?')
        deep_sentences = deep_text.count('.') + deep_text.count('!') + deep_text.count('?')
        
        direct_avg_sentence = direct['word_count'] / max(direct_sentences, 1)
        deep_avg_sentence = deep['word_count'] / max(deep_sentences, 1)
        
        if deep_avg_sentence > direct_avg_sentence * 1.2:  # Deep sentences should be 20% longer on average
            comparison_checks.append(f"✅ Deep has more complex sentences: {deep_avg_sentence:.1f} vs {direct_avg_sentence:.1f} words/sentence")
        else:
            comparison_checks.append(f"❌ Sentence complexity not significantly different: {deep_avg_sentence:.1f} vs {direct_avg_sentence:.1f} words/sentence")
        
        # 4. Consultation types are correctly saved
        if direct['consultation_type'] == 'direct' and deep['consultation_type'] == 'deep':
            comparison_checks.append("✅ Consultation types correctly saved and different")
        else:
            comparison_checks.append(f"❌ Consultation types not correctly saved: direct={direct['consultation_type']}, deep={deep['consultation_type']}")
        
        print("   Comparison Results:")
        for check in comparison_checks:
            print(f"     {check}")
        
        passed_checks = sum(1 for check in comparison_checks if check.startswith("✅"))
        if passed_checks >= 3:
            self.log_test("Compare Interpretations for Distinct Differences", True)
            return True
        else:
            self.log_test("Compare Interpretations for Distinct Differences", False, 
                        f"Only {passed_checks}/4 checks passed")
            return False

    def test_consultation_type_saved_in_database(self):
        """Verify consultation_type is saved in consultation record by calling GET /api/consultations"""
        success, response = self.run_test(
            "GET /api/consultations to verify consultation_type saved",
            "GET",
            "consultations",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Retrieved {len(response)} consultations from database")
            
            # Find our test consultations
            direct_found = None
            deep_found = None
            
            for consultation in response:
                if hasattr(self, 'direct_consultation') and consultation.get('id') == self.direct_consultation['id']:
                    direct_found = consultation
                elif hasattr(self, 'deep_consultation') and consultation.get('id') == self.deep_consultation['id']:
                    deep_found = consultation
            
            verification_checks = []
            
            # Check direct consultation in database
            if direct_found:
                if direct_found.get('consultation_type') == 'direct':
                    verification_checks.append("✅ Direct consultation type correctly saved in database")
                else:
                    verification_checks.append(f"❌ Direct consultation type incorrect in database: {direct_found.get('consultation_type')}")
            else:
                verification_checks.append("❌ Direct consultation not found in database")
            
            # Check deep consultation in database
            if deep_found:
                if deep_found.get('consultation_type') == 'deep':
                    verification_checks.append("✅ Deep consultation type correctly saved in database")
                else:
                    verification_checks.append(f"❌ Deep consultation type incorrect in database: {deep_found.get('consultation_type')}")
            else:
                verification_checks.append("❌ Deep consultation not found in database")
            
            print("   Database Verification:")
            for check in verification_checks:
                print(f"     {check}")
            
            passed_checks = sum(1 for check in verification_checks if check.startswith("✅"))
            if passed_checks == len(verification_checks):
                self.log_test("GET /api/consultations to verify consultation_type saved", True)
                return True
            else:
                self.log_test("GET /api/consultations to verify consultation_type saved", False, 
                            f"Only {passed_checks}/{len(verification_checks)} checks passed")
                return False
        
        return False

    def run_review_tests(self):
        """Run the specific tests requested in the review"""
        print("🚀 Starting Consultation Type Feature Review Tests")
        print("=" * 60)
        print("Testing the new consultation type feature for 'I Ching del Benessere' app")
        print("=" * 60)
        
        if not self.setup_user():
            print("❌ Failed to setup test user")
            return 1
        
        tests = [
            self.test_direct_consultation_as_specified,
            self.test_deep_consultation_as_specified,
            self.test_interpretations_are_distinctly_different,
            self.test_consultation_type_saved_in_database,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Review Test Summary: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All review tests passed! Consultation type feature is working correctly.")
            return 0
        else:
            print("⚠️  Some review tests failed")
            return 1

def main():
    tester = ConsultationTypeReviewTester()
    return tester.run_review_tests()

if __name__ == "__main__":
    sys.exit(main())