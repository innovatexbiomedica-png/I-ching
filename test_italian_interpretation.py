import requests
import json

# Test the Italian interpretation specifically
base_url = "https://preview-sito.preview.emergentagent.com/api"

# First register and login
user_data = {
    "email": "italian_test@test.com",
    "password": "TestPass123!",
    "name": "Italian Test User",
    "language": "it"
}

# Register
response = requests.post(f"{base_url}/auth/register", json=user_data)
print(f"Registration: {response.status_code}")

# Login
login_data = {"email": user_data["email"], "password": user_data["password"]}
response = requests.post(f"{base_url}/auth/login", json=login_data)
token = response.json()["token"]
print(f"Login: {response.status_code}")

# Create consultation with moving lines in Italian
headers = {"Authorization": f"Bearer {token}"}
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

response = requests.post(f"{base_url}/consultations", json=consultation_data, headers=headers)
result = response.json()

print(f"\nConsultation Status: {response.status_code}")
print(f"Hexagram: {result.get('hexagram_number')} - {result.get('hexagram_name')}")
print(f"Moving lines: {result.get('moving_lines', [])}")
print(f"Derived hexagram: {result.get('derived_hexagram_number')} - {result.get('derived_hexagram_name', 'None')}")

interpretation = result.get('interpretation', '')
word_count = len(interpretation.split())
print(f"Word count: {word_count}")

print(f"\nInterpretation (first 500 chars):")
print(interpretation[:500])
print("...")

# Check for Italian traditional keywords
italian_keywords = ["giudizio", "immagine", "trigramma", "linea", "mutevole", "esagramma", "tao", "drago", "acqua", "monte", "vento", "fuoco", "terra", "cielo"]
found_keywords = [kw for kw in italian_keywords if kw.lower() in interpretation.lower()]
print(f"\nFound Italian keywords: {found_keywords}")

# Check for career-related keywords
career_keywords = ["carriera", "lavoro", "professione", "anno", "futuro"]
found_career = [kw for kw in career_keywords if kw.lower() in interpretation.lower()]
print(f"Found career keywords: {found_career}")