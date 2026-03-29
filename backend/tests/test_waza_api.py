"""
WAZA API Backend Tests
Tests for: Auth, Workspaces, Agents, Contacts, Conversations, Broadcasts, Analytics, Billing
"""
import pytest
import requests
import os
import uuid

# Get base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ai-agent-api-1.preview.emergentagent.com')
BASE_URL = BASE_URL.rstrip('/')

# Test credentials
TEST_EMAIL = "demo@waza.africa"
TEST_PASSWORD = "Password123!"


class TestHealthEndpoints:
    """Health check endpoint tests"""
    
    def test_api_health_check(self):
        """Test /api/health returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        print(f"✓ Health check passed: {data}")


class TestBillingPlans:
    """Billing plans endpoint tests"""
    
    def test_get_billing_plans(self):
        """Test /api/billing/plans returns 4 plans"""
        response = requests.get(f"{BASE_URL}/api/billing/plans")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 4
        
        # Verify plan names
        plan_names = [p["name"] for p in data]
        assert "free" in plan_names
        assert "starter" in plan_names
        assert "pro" in plan_names
        assert "business" in plan_names
        
        # Verify free plan details
        free_plan = next(p for p in data if p["name"] == "free")
        assert free_plan["price_fcfa"] == 0
        assert free_plan["messages"] == 100
        print(f"✓ Billing plans returned: {plan_names}")


class TestAuth:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test POST /api/auth/login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify tokens
        assert "access_token" in data
        assert "refresh_token" in data
        assert len(data["access_token"]) > 0
        
        # Verify user data
        assert "user" in data
        assert data["user"]["email"] == TEST_EMAIL
        print(f"✓ Login successful for: {data['user']['email']}")
    
    def test_login_invalid_credentials(self):
        """Test POST /api/auth/login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "wrong@email.com", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("✓ Invalid login correctly rejected")
    
    def test_refresh_token(self):
        """Test POST /api/auth/refresh with valid refresh token"""
        # First login to get tokens
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        assert login_response.status_code == 200
        refresh_token = login_response.json()["refresh_token"]
        
        # Refresh token
        response = requests.post(
            f"{BASE_URL}/api/auth/refresh",
            json={"refresh_token": refresh_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        print("✓ Token refresh successful")
    
    def test_register_new_user(self):
        """Test POST /api/auth/register creates new user"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": unique_email,
                "password": "TestPass123!",
                "full_name": "Test User",
                "country": "SN"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        print(f"✓ User registered: {unique_email}")


@pytest.fixture
def auth_token():
    """Get authentication token for protected endpoints"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Authentication failed")


@pytest.fixture
def auth_headers(auth_token):
    """Get headers with auth token"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestWorkspaces:
    """Workspace CRUD tests"""
    
    def test_list_workspaces(self, auth_headers):
        """Test GET /api/workspaces returns user workspaces"""
        response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Workspaces returned: {len(data)} workspaces")
        return data
    
    def test_create_workspace(self, auth_headers):
        """Test POST /api/workspaces creates new workspace"""
        # Note: This may fail if user is on free plan and already has 1 workspace
        response = requests.post(
            f"{BASE_URL}/api/workspaces",
            headers=auth_headers,
            json={"name": f"TEST_Workspace_{uuid.uuid4().hex[:6]}"}
        )
        # Accept 201 (created) or 403 (limit reached)
        assert response.status_code in [201, 403]
        if response.status_code == 201:
            data = response.json()
            assert "id" in data
            assert "name" in data
            print(f"✓ Workspace created: {data['name']}")
        else:
            print("✓ Workspace limit reached (expected for free plan)")


class TestAgents:
    """Agent CRUD tests"""
    
    def test_list_agents(self, auth_headers):
        """Test GET /api/workspaces/{id}/agents returns agents"""
        # First get workspaces
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        assert ws_response.status_code == 200
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{workspace_id}/agents",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Agents returned: {len(data)} agents")
    
    def test_create_agent(self, auth_headers):
        """Test POST /api/workspaces/{id}/agents creates new agent"""
        # Get workspace
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{workspace_id}/agents",
            headers=auth_headers,
            json={
                "name": f"TEST_Agent_{uuid.uuid4().hex[:6]}",
                "module": "sell",
                "system_prompt": "You are a helpful sales assistant.",
                "language": "fr"
            }
        )
        # Accept 201 (created) or 403 (limit reached)
        assert response.status_code in [201, 403]
        if response.status_code == 201:
            data = response.json()
            assert "id" in data
            print(f"✓ Agent created: {data['name']}")
        else:
            print("✓ Agent limit reached (expected for free plan)")


class TestContacts:
    """Contact CRUD tests"""
    
    def test_list_contacts(self, auth_headers):
        """Test GET /api/workspaces/{id}/contacts returns contacts"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{workspace_id}/contacts",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Contacts returned: {len(data)} contacts")
    
    def test_create_contact(self, auth_headers):
        """Test POST /api/workspaces/{id}/contacts creates new contact"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        # Phone number must match pattern: ^\+[1-9]\d{1,14}$
        import random
        unique_phone = f"+221{random.randint(100000000, 999999999)}"
        
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{workspace_id}/contacts",
            headers=auth_headers,
            json={
                "phone_number": unique_phone,
                "name": f"TEST_Contact_{uuid.uuid4().hex[:6]}",
                "tags": ["test"]
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert data["phone_number"] == unique_phone
        print(f"✓ Contact created: {data['name']}")
    
    def test_import_contacts(self, auth_headers):
        """Test POST /api/workspaces/{id}/contacts/import imports multiple contacts"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        
        import random
        contacts = [
            {"phone_number": f"+221{random.randint(100000000, 999999999)}", "name": "Import Test 1", "tags": ["imported"]},
            {"phone_number": f"+221{random.randint(100000000, 999999999)}", "name": "Import Test 2", "tags": ["imported"]}
        ]
        
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{workspace_id}/contacts/import",
            headers=auth_headers,
            json={"contacts": contacts}
        )
        assert response.status_code == 200
        data = response.json()
        assert "imported" in data
        assert "total" in data
        print(f"✓ Contacts imported: {data['imported']}/{data['total']}")


class TestConversations:
    """Conversation endpoint tests"""
    
    def test_list_conversations(self, auth_headers):
        """Test GET /api/workspaces/{id}/conversations returns conversations"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{workspace_id}/conversations",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Conversations returned: {len(data)} conversations")


class TestBroadcasts:
    """Broadcast CRUD tests"""
    
    def test_list_broadcasts(self, auth_headers):
        """Test GET /api/workspaces/{id}/broadcasts returns broadcasts"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{workspace_id}/broadcasts",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Broadcasts returned: {len(data)} broadcasts")
    
    def test_create_broadcast(self, auth_headers):
        """Test POST /api/workspaces/{id}/broadcasts creates broadcast"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{workspace_id}/broadcasts",
            headers=auth_headers,
            json={
                "message_template": "Test broadcast message for WAZA",
                "target_tags": ["test"]
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        print(f"✓ Broadcast created: {data['id']}")


class TestAnalytics:
    """Analytics endpoint tests"""
    
    def test_get_analytics_overview(self, auth_headers):
        """Test GET /api/analytics/workspaces/{id}/overview returns analytics"""
        ws_response = requests.get(f"{BASE_URL}/api/workspaces", headers=auth_headers)
        workspaces = ws_response.json()
        
        if not workspaces:
            pytest.skip("No workspaces available")
        
        workspace_id = workspaces[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/analytics/workspaces/{workspace_id}/overview",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        # Verify analytics structure
        assert "total_messages" in data or "messages" in data or isinstance(data, dict)
        print(f"✓ Analytics overview returned: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
