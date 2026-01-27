#!/usr/bin/env python3
import requests
import json
from datetime import datetime

class SynthesisAPITester:
    def __init__(self, base_url="https://iching-analyzer.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.consultation_ids = []

    def register_and_login(self):
        """Register and login a test user"""
        timestamp = datetime.now().strftime('%H%M%S')
        
        # Register
        user_data = {
            "email": f"synthesis_test_{timestamp}@test.com",
            "password": "TestPass123!",
            "name": f"Synthesis Test {timestamp}",
            "language": "it"
        }
        
        response = requests.post(f"{self.base_url}/auth/register", json=user_data)
        if response.status_code != 200:
            print(f"❌ Registration failed: {response.text}")
            return False
        
        # Login
        login_data = {"email": user_data["email"], "password": user_data["password"]}
        response = requests.post(f"{self.base_url}/auth/login", json=login_data)
        if response.status_code != 200:
            print(f"❌ Login failed: {response.text}")
            return False
        
        self.token = response.json()["token"]
        print(f"✅ User registered and logged in")
        return True

    def create_consultations(self):
        """Create test consultations"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        consultations = [
            {
                "question": "What should I focus on in my career development?",
                "coin_tosses": {"line1": 7, "line2": 8, "line3": 9, "line4": 6, "line5": 7, "line6": 8}
            },
            {
                "question": "How can I improve my personal relationships?",
                "coin_tosses": {"line1": 6, "line2": 7, "line3": 8, "line4": 9, "line5": 6, "line6": 7}
            },
            {
                "question": "What is blocking my spiritual growth?",
                "coin_tosses": {"line1": 8, "line2": 9, "line3": 7, "line4": 8, "line5": 9, "line6": 6}
            }
        ]
        
        for i, consultation in enumerate(consultations, 1):
            response = requests.post(f"{self.base_url}/consultations", json=consultation, headers=headers)
            if response.status_code != 200:
                print(f"❌ Failed to create consultation {i}: {response.text}")
                return False
            
            consultation_id = response.json()["id"]
            self.consultation_ids.append(consultation_id)
            print(f"✅ Created consultation {i}: {response.json().get('hexagram_name', 'Unknown')}")
        
        return True

    def test_synthesis_deepening(self):
        """Test synthesis with deepening type"""
        headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
        
        synthesis_data = {
            "consultation_ids": self.consultation_ids[:2],  # Use first 2 consultations
            "synthesis_type": "deepening"
        }
        
        print(f"\n🔍 Testing synthesis with deepening type...")
        response = requests.post(f"{self.base_url}/consultations/synthesis", json=synthesis_data, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Synthesis failed: {response.status_code} - {response.text}")
            return False
        
        result = response.json()
        
        # Verify response structure
        required_fields = ['id', 'is_synthesis', 'linked_consultation_ids', 'synthesis_type', 'interpretation']
        missing_fields = [field for field in required_fields if field not in result]
        
        if missing_fields:
            print(f"❌ Missing fields in response: {missing_fields}")
            return False
        
        # Verify field values
        if not result.get('is_synthesis'):
            print(f"❌ is_synthesis should be True")
            return False
        
        if result.get('synthesis_type') != 'deepening':
            print(f"❌ synthesis_type should be 'deepening', got '{result.get('synthesis_type')}'")
            return False
        
        if result.get('linked_consultation_ids') != self.consultation_ids[:2]:
            print(f"❌ linked_consultation_ids mismatch")
            return False
        
        interpretation = result.get('interpretation', '')
        if len(interpretation) < 100:
            print(f"❌ Interpretation too short ({len(interpretation)} chars): {interpretation}")
            return False
        
        print(f"✅ Synthesis created successfully!")
        print(f"   ID: {result['id']}")
        print(f"   Type: {result['synthesis_type']}")
        print(f"   Linked consultations: {len(result['linked_consultation_ids'])}")
        print(f"   Interpretation length: {len(interpretation)} characters")
        print(f"   Question preview: {result.get('question', '')[:100]}...")
        print(f"   Interpretation preview: {interpretation[:200]}...")
        
        return True

    def run_test(self):
        """Run the complete synthesis test"""
        print("🚀 Starting Synthesis API Test")
        print("=" * 50)
        
        if not self.register_and_login():
            return False
        
        if not self.create_consultations():
            return False
        
        if not self.test_synthesis_deepening():
            return False
        
        print("\n" + "=" * 50)
        print("🎉 Synthesis test completed successfully!")
        return True

if __name__ == "__main__":
    tester = SynthesisAPITester()
    success = tester.run_test()
    exit(0 if success else 1)