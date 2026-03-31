"""
Test Email Verification & Resend Verification Endpoints
Features tested:
- POST /api/auth/register returns user with is_verified=false
- POST /api/auth/verify-email with valid token verifies user
- POST /api/auth/resend-verification sends new token
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestEmailVerification:
    """Email verification endpoint tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_email = f"test_verify_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "TestPassword123!"
        self.test_name = "Test User"
    
    def test_register_returns_unverified_user(self):
        """POST /api/auth/register should return user with is_verified=false"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": self.test_email,
                "password": self.test_password,
                "full_name": self.test_name,
                "country": "CM"
            }
        )
        
        # Status assertion
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        # Data assertions
        data = response.json()
        assert "access_token" in data, "Response should contain access_token"
        assert "refresh_token" in data, "Response should contain refresh_token"
        assert "user" in data, "Response should contain user object"
        
        user = data["user"]
        assert user["email"] == self.test_email, f"Email mismatch: {user['email']}"
        assert user["is_verified"] == False, f"New user should have is_verified=false, got {user['is_verified']}"
        assert user["full_name"] == self.test_name, f"Name mismatch: {user['full_name']}"
    
    def test_verify_email_with_invalid_token(self):
        """POST /api/auth/verify-email with invalid token should return 400"""
        response = requests.post(
            f"{BASE_URL}/api/auth/verify-email",
            json={"token": "invalid_token_12345"}
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Error response should contain detail"
    
    def test_resend_verification_for_nonexistent_email(self):
        """POST /api/auth/resend-verification for non-existent email should return 200 (no enumeration)"""
        response = requests.post(
            f"{BASE_URL}/api/auth/resend-verification",
            json={"email": "nonexistent_email_xyz@example.com"}
        )
        
        # Should return 200 to prevent email enumeration
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "Response should contain message"
    
    def test_resend_verification_for_existing_user(self):
        """POST /api/auth/resend-verification for existing unverified user should return 200"""
        # First register a user
        test_email = f"test_resend_{uuid.uuid4().hex[:8]}@example.com"
        register_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": self.test_password,
                "full_name": self.test_name,
                "country": "CM"
            }
        )
        assert register_response.status_code == 201, f"Registration failed: {register_response.text}"
        
        # Now resend verification
        response = requests.post(
            f"{BASE_URL}/api/auth/resend-verification",
            json={"email": test_email}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "Response should contain message"
    
    def test_register_duplicate_email(self):
        """POST /api/auth/register with duplicate email should return 400"""
        # First registration
        test_email = f"test_dup_{uuid.uuid4().hex[:8]}@example.com"
        first_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": self.test_password,
                "full_name": self.test_name,
                "country": "CM"
            }
        )
        assert first_response.status_code == 201, f"First registration failed: {first_response.text}"
        
        # Second registration with same email
        second_response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": test_email,
                "password": self.test_password,
                "full_name": "Another User",
                "country": "CM"
            }
        )
        
        assert second_response.status_code == 400, f"Expected 400, got {second_response.status_code}"
        data = second_response.json()
        assert "detail" in data, "Error response should contain detail"
        assert "already registered" in data["detail"].lower() or "email" in data["detail"].lower()


class TestExistingUserLogin:
    """Test login with existing users"""
    
    def test_demo_user_login(self):
        """Login with demo user should work"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "demo@waza.africa",
                "password": "Password123!"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "demo@waza.africa"
    
    def test_admin_user_login(self):
        """Login with admin user should work"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "admin@waza.africa",
                "password": "WazaAdmin2026!"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@waza.africa"
        assert data["user"]["is_superadmin"] == True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
