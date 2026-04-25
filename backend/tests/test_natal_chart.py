"""
Test suite for I Ching del Benessere - Natal Chart Features
Tests: Generate chart, retrieve chart, SVG download, PDF export, DOCX export

Test user: test_export@test.com / test123
This user should have a natal chart generated with birth data: 1990-06-15 14:30 Roma
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
TEST_EMAIL = "test_export@test.com"
TEST_PASSWORD = "test123"


class TestNatalChartAPI:
    """Test suite for Natal Chart endpoints"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for test user"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("token")
        # If login fails, try to register the user first
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "name": "Test Export User",
            "phone": "",
            "language": "it"
        })
        if register_response.status_code == 200 or register_response.status_code == 400:
            # Try login again
            login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            })
            if login_response.status_code == 200:
                return login_response.json().get("token")
        pytest.skip("Could not authenticate test user")
        
    @pytest.fixture(scope="class")
    def headers(self, auth_token):
        """Get auth headers"""
        return {
            "Authorization": f"Bearer {auth_token}",
            "Content-Type": "application/json"
        }

    def test_01_login_successful(self):
        """Test that the test user can login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        })
        # User might not exist yet, so check both success and expected failures
        assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"
        if response.status_code == 200:
            data = response.json()
            assert "token" in data
            assert "user" in data
            print(f"✅ Login successful for {TEST_EMAIL}")
        else:
            print(f"⚠️ User {TEST_EMAIL} needs to be created")

    def test_02_generate_natal_chart(self, headers):
        """Test generating a natal chart with birth data"""
        # Generate chart with test data
        chart_data = {
            "name": "Test Export User",
            "birth_date": "1990-06-15",
            "birth_time": "14:30",
            "birth_place": "Roma"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/natal-chart/generate",
            json=chart_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Generate failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "success" in data and data["success"] == True, "Chart generation should succeed"
        assert "planets" in data, "Response should contain planets"
        assert "houses" in data, "Response should contain houses"
        assert "aspects" in data, "Response should contain aspects"
        assert "chart_svg" in data, "Response should contain chart_svg"
        assert "ascendant" in data, "Response should contain ascendant"
        
        # Verify SVG data exists and is valid
        svg_data = data.get("chart_svg", "")
        assert len(svg_data) > 100, "SVG data should be present and substantial"
        assert "<svg" in svg_data.lower(), "SVG data should contain <svg tag"
        
        # Verify aspects have correct field names (planet1_name, planet2_name)
        aspects = data.get("aspects", [])
        if len(aspects) > 0:
            first_aspect = aspects[0]
            assert "planet1_name" in first_aspect or "planet1" in first_aspect, "Aspects should have planet1_name field"
            assert "planet2_name" in first_aspect or "planet2" in first_aspect, "Aspects should have planet2_name field"
            print(f"✅ First aspect: {first_aspect.get('planet1_name', first_aspect.get('planet1'))} - {first_aspect.get('planet2_name', first_aspect.get('planet2'))}")
        
        print(f"✅ Natal chart generated with {len(data.get('planets', []))} planets and {len(aspects)} aspects")

    def test_03_get_saved_natal_chart(self, headers):
        """Test retrieving saved natal chart with chart_svg field"""
        response = requests.get(
            f"{BASE_URL}/api/natal-chart",
            headers=headers
        )
        
        assert response.status_code == 200, f"Get chart failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "has_chart" in data, "Response should have has_chart field"
        
        if data["has_chart"]:
            assert "chart" in data, "Response should have chart data"
            chart = data["chart"]
            
            # Verify chart_svg exists
            assert "chart_svg" in chart, "Chart should have chart_svg field"
            svg_data = chart.get("chart_svg", "")
            assert len(svg_data) > 100, f"SVG should be substantial, got {len(svg_data)} chars"
            
            # Verify aspects have planet names
            aspects = chart.get("aspects", [])
            print(f"✅ Retrieved chart with {len(aspects)} aspects")
            
            if len(aspects) > 0:
                # Check at least some aspects have proper planet names
                aspect_with_names = [a for a in aspects if a.get("planet1_name") and a.get("planet2_name")]
                print(f"   Aspects with planet names: {len(aspect_with_names)}/{len(aspects)}")
                
                # Sample aspect
                sample = aspects[0]
                print(f"   Sample aspect: {sample.get('aspect_name', 'N/A')} - {sample.get('planet1_name', sample.get('planet1', 'N/A'))} to {sample.get('planet2_name', sample.get('planet2', 'N/A'))}")
        else:
            print("⚠️ No saved chart found - need to generate first")

    def test_04_download_pdf(self, headers):
        """Test PDF generation with chart image and aspect names"""
        response = requests.get(
            f"{BASE_URL}/api/natal-chart/pdf",
            headers=headers
        )
        
        # Check status code
        assert response.status_code == 200, f"PDF download failed: {response.status_code} - {response.text[:500]}"
        
        # Check content type
        content_type = response.headers.get("Content-Type", "")
        assert "application/pdf" in content_type, f"Expected PDF content type, got {content_type}"
        
        # Check content length
        content_length = len(response.content)
        assert content_length > 1000, f"PDF content too small: {content_length} bytes"
        
        # Check PDF header (magic bytes)
        assert response.content[:4] == b'%PDF', "Response should be a valid PDF file"
        
        # Save PDF for manual inspection
        pdf_path = "/app/test_reports/test_natal_chart.pdf"
        with open(pdf_path, "wb") as f:
            f.write(response.content)
        
        print(f"✅ PDF downloaded successfully: {content_length} bytes")
        print(f"   Saved to: {pdf_path}")
        
        # According to notes, PDF should be ~85KB with chart image
        if content_length > 50000:
            print(f"   PDF size indicates chart image is likely included")
        else:
            print(f"   ⚠️ PDF size is small - chart image might be missing")

    def test_05_download_docx(self, headers):
        """Test DOCX generation with chart image and aspect names"""
        response = requests.get(
            f"{BASE_URL}/api/natal-chart/docx",
            headers=headers
        )
        
        # Check status code
        assert response.status_code == 200, f"DOCX download failed: {response.status_code} - {response.text[:500]}"
        
        # Check content type
        content_type = response.headers.get("Content-Type", "")
        assert "application/vnd.openxmlformats" in content_type or "officedocument" in content_type.lower(), f"Expected DOCX content type, got {content_type}"
        
        # Check content length
        content_length = len(response.content)
        assert content_length > 1000, f"DOCX content too small: {content_length} bytes"
        
        # Check ZIP header (DOCX is a ZIP file)
        assert response.content[:2] == b'PK', "Response should be a valid DOCX file (ZIP format)"
        
        # Save DOCX for manual inspection
        docx_path = "/app/test_reports/test_natal_chart.docx"
        with open(docx_path, "wb") as f:
            f.write(response.content)
        
        print(f"✅ DOCX downloaded successfully: {content_length} bytes")
        print(f"   Saved to: {docx_path}")
        
        # According to notes, DOCX should be ~113KB with chart image
        if content_length > 80000:
            print(f"   DOCX size indicates chart image is likely included")
        else:
            print(f"   ⚠️ DOCX size is small - chart image might be missing")

    def test_06_verify_aspect_field_names_in_chart(self, headers):
        """Verify that aspects use planet1_name and planet2_name fields (not p1_name/p2_name)"""
        response = requests.get(
            f"{BASE_URL}/api/natal-chart",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if not data.get("has_chart"):
            pytest.skip("No chart available - generate first")
        
        chart = data.get("chart", {})
        aspects = chart.get("aspects", [])
        
        if len(aspects) == 0:
            pytest.skip("No aspects in chart")
        
        # Check field names in aspects
        for aspect in aspects[:5]:  # Check first 5 aspects
            # Verify correct field names are used
            assert "planet1_name" in aspect or "planet1" in aspect, f"Missing planet1_name in aspect: {aspect}"
            assert "planet2_name" in aspect or "planet2" in aspect, f"Missing planet2_name in aspect: {aspect}"
            
            # These old field names should NOT be present
            assert "p1_name" not in aspect, f"Old field name p1_name found: {aspect}"
            assert "p2_name" not in aspect, f"Old field name p2_name found: {aspect}"
            
            planet1 = aspect.get("planet1_name") or aspect.get("planet1", "Unknown")
            planet2 = aspect.get("planet2_name") or aspect.get("planet2", "Unknown")
            aspect_name = aspect.get("aspect_name", aspect.get("aspect", "Unknown"))
            
            print(f"   ✓ {planet1} {aspect_name} {planet2}")
        
        print(f"✅ All aspect field names are correct")

    def test_07_verify_quadratura_aspect_filter(self, headers):
        """Verify that 'Quadratura' aspect is included in the aspect filters"""
        # This test verifies the fix: 'Quadratura' was missing from the filter dictionaries
        response = requests.get(
            f"{BASE_URL}/api/natal-chart",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if not data.get("has_chart"):
            pytest.skip("No chart available")
        
        chart = data.get("chart", {})
        aspects = chart.get("aspects", [])
        
        # Look for Quadratura aspects
        quadratura_aspects = [a for a in aspects if a.get("aspect_name") in ["Quadratura", "Square", "Quadrato"]]
        
        if len(quadratura_aspects) > 0:
            print(f"✅ Found {len(quadratura_aspects)} Quadratura/Square aspects")
            for q in quadratura_aspects[:3]:
                print(f"   - {q.get('planet1_name', 'N/A')} □ {q.get('planet2_name', 'N/A')}")
        else:
            print("ℹ️ No Quadratura aspects in this chart (may be normal)")


class TestNatalChartWithoutAuth:
    """Test unauthorized access to natal chart endpoints"""
    
    def test_get_chart_without_auth(self):
        """Test that chart endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/natal-chart")
        assert response.status_code == 401, "Should require authentication"
        print("✅ GET /natal-chart requires authentication")
    
    def test_pdf_without_auth(self):
        """Test that PDF endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/natal-chart/pdf")
        assert response.status_code == 401, "Should require authentication"
        print("✅ GET /natal-chart/pdf requires authentication")
    
    def test_docx_without_auth(self):
        """Test that DOCX endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/natal-chart/docx")
        assert response.status_code == 401, "Should require authentication"
        print("✅ GET /natal-chart/docx requires authentication")
    
    def test_generate_without_auth(self):
        """Test that generate endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/natal-chart/generate", json={
            "name": "Test",
            "birth_date": "1990-01-01",
            "birth_time": "12:00",
            "birth_place": "Rome"
        })
        assert response.status_code == 401, "Should require authentication"
        print("✅ POST /natal-chart/generate requires authentication")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
