"""
WAZA Admin Dashboard API Tests
Tests for: Admin Stats, Users CRUD, Revenues, Workspaces, Messages, Security
"""
import pytest
import requests
import os

# Get base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ai-agent-api-1.preview.emergentagent.com')
BASE_URL = BASE_URL.rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@waza.africa"
ADMIN_PASSWORD = "WazaAdmin2026!"

# Demo user credentials (non-admin)
DEMO_EMAIL = "demo@waza.africa"
DEMO_PASSWORD = "Password123!"


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_returns_is_superadmin_true(self):
        """Test POST /api/auth/login with admin credentials returns is_superadmin=true"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        
        # Verify tokens
        assert "access_token" in data
        assert "refresh_token" in data
        
        # Verify user is superadmin
        assert "user" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["is_superadmin"] == True, "Admin user should have is_superadmin=true"
        print(f"✓ Admin login successful: {data['user']['email']} (is_superadmin={data['user']['is_superadmin']})")
    
    def test_demo_user_login_returns_is_superadmin_false(self):
        """Test POST /api/auth/login with demo user returns is_superadmin=false"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["user"]["is_superadmin"] == False, "Demo user should have is_superadmin=false"
        print(f"✓ Demo user login: is_superadmin={data['user']['is_superadmin']}")


@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip(f"Admin authentication failed: {response.text}")


@pytest.fixture
def admin_headers(admin_token):
    """Get headers with admin token"""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def demo_token():
    """Get demo user authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["access_token"]
    pytest.skip("Demo user authentication failed")


@pytest.fixture
def demo_headers(demo_token):
    """Get headers with demo user token"""
    return {"Authorization": f"Bearer {demo_token}"}


class TestAdminStats:
    """Admin stats endpoint tests"""
    
    def test_get_admin_stats(self, admin_headers):
        """Test GET /api/admin/stats returns global platform statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify required fields
        assert "total_users" in data
        assert "active_users" in data
        assert "mrr_fcfa" in data
        assert "plan_distribution" in data
        assert "total_workspaces" in data
        assert "total_messages" in data
        assert "messages_today" in data
        
        # Verify data types
        assert isinstance(data["total_users"], int)
        assert isinstance(data["mrr_fcfa"], (int, float))
        assert isinstance(data["plan_distribution"], dict)
        
        print(f"✓ Admin stats: {data['total_users']} users, MRR: {data['mrr_fcfa']} FCFA")


class TestAdminUsers:
    """Admin users management tests"""
    
    def test_list_users(self, admin_headers):
        """Test GET /api/admin/users returns paginated user list"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify pagination structure
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert "per_page" in data
        assert "pages" in data
        
        # Verify users data
        assert isinstance(data["users"], list)
        if data["users"]:
            user = data["users"][0]
            assert "id" in user
            assert "email" in user
            assert "plan" in user
            assert "is_active" in user
        
        print(f"✓ Users list: {data['total']} total users, page {data['page']}/{data['pages']}")
    
    def test_list_users_with_search(self, admin_headers):
        """Test GET /api/admin/users with search parameter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers=admin_headers,
            params={"search": "demo"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Should find demo user
        assert isinstance(data["users"], list)
        print(f"✓ Users search 'demo': found {len(data['users'])} users")
    
    def test_list_users_with_plan_filter(self, admin_headers):
        """Test GET /api/admin/users with plan filter"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers=admin_headers,
            params={"plan": "free"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned users should be on free plan
        for user in data["users"]:
            assert user["plan"] == "free"
        
        print(f"✓ Users filter by plan 'free': {len(data['users'])} users")
    
    def test_get_user_detail(self, admin_headers):
        """Test GET /api/admin/users/{id} returns user detail with workspaces and payments"""
        # First get a user ID
        list_response = requests.get(f"{BASE_URL}/api/admin/users", headers=admin_headers)
        users = list_response.json()["users"]
        
        if not users:
            pytest.skip("No users available")
        
        user_id = users[0]["id"]
        response = requests.get(f"{BASE_URL}/api/admin/users/{user_id}", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify user detail structure
        assert "id" in data
        assert "email" in data
        assert "workspaces" in data
        assert "payments" in data
        assert "subscriptions" in data
        
        assert isinstance(data["workspaces"], list)
        assert isinstance(data["payments"], list)
        
        print(f"✓ User detail: {data['email']} with {len(data['workspaces'])} workspaces")
    
    def test_get_user_detail_not_found(self, admin_headers):
        """Test GET /api/admin/users/{id} returns 404 for non-existent user"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users/non-existent-id-12345",
            headers=admin_headers
        )
        assert response.status_code == 404
        print("✓ User not found returns 404")


class TestAdminUserActions:
    """Admin user suspend/plan change tests"""
    
    def test_suspend_and_reactivate_user(self, admin_headers):
        """Test PUT /api/admin/users/{id}/suspend suspends and reactivates user"""
        # Get demo user ID
        list_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers=admin_headers,
            params={"search": "demo@waza.africa"}
        )
        users = list_response.json()["users"]
        
        if not users:
            pytest.skip("Demo user not found")
        
        user_id = users[0]["id"]
        
        # Suspend user
        suspend_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/suspend",
            headers=admin_headers,
            json={"suspend": True}
        )
        assert suspend_response.status_code == 200, f"Suspend failed: {suspend_response.text}"
        assert suspend_response.json()["is_active"] == False
        print("✓ User suspended")
        
        # Reactivate user
        reactivate_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/suspend",
            headers=admin_headers,
            json={"suspend": False}
        )
        assert reactivate_response.status_code == 200
        assert reactivate_response.json()["is_active"] == True
        print("✓ User reactivated")
    
    def test_change_user_plan(self, admin_headers):
        """Test PUT /api/admin/users/{id}/plan changes user plan"""
        # Get demo user ID
        list_response = requests.get(
            f"{BASE_URL}/api/admin/users",
            headers=admin_headers,
            params={"search": "demo@waza.africa"}
        )
        users = list_response.json()["users"]
        
        if not users:
            pytest.skip("Demo user not found")
        
        user_id = users[0]["id"]
        original_plan = users[0]["plan"]
        
        # Change to starter plan
        new_plan = "starter" if original_plan != "starter" else "pro"
        change_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/plan",
            headers=admin_headers,
            json={"plan": new_plan}
        )
        assert change_response.status_code == 200, f"Plan change failed: {change_response.text}"
        assert change_response.json()["plan"] == new_plan
        print(f"✓ User plan changed to {new_plan}")
        
        # Revert to original plan
        revert_response = requests.put(
            f"{BASE_URL}/api/admin/users/{user_id}/plan",
            headers=admin_headers,
            json={"plan": original_plan}
        )
        assert revert_response.status_code == 200
        print(f"✓ User plan reverted to {original_plan}")


class TestAdminRevenues:
    """Admin revenues endpoint tests"""
    
    def test_get_revenues(self, admin_headers):
        """Test GET /api/admin/revenues returns MRR and transactions"""
        response = requests.get(f"{BASE_URL}/api/admin/revenues", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify revenue structure
        assert "mrr_fcfa" in data
        assert "mrr_usd" in data
        assert "total_revenue_fcfa" in data
        assert "revenue_by_plan" in data
        assert "transactions" in data
        
        assert isinstance(data["transactions"], list)
        assert isinstance(data["revenue_by_plan"], dict)
        
        print(f"✓ Revenues: MRR {data['mrr_fcfa']} FCFA, {len(data['transactions'])} transactions")


class TestAdminWorkspaces:
    """Admin workspaces endpoint tests"""
    
    def test_list_workspaces(self, admin_headers):
        """Test GET /api/admin/workspaces returns all workspaces with owner info"""
        response = requests.get(f"{BASE_URL}/api/admin/workspaces", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify pagination structure
        assert "workspaces" in data
        assert "total" in data
        assert "page" in data
        
        # Verify workspace data
        if data["workspaces"]:
            ws = data["workspaces"][0]
            assert "id" in ws
            assert "name" in ws
            assert "owner_email" in ws
            assert "owner_name" in ws
            assert "whatsapp_connected" in ws
            assert "agents_count" in ws
            assert "contacts_count" in ws
        
        print(f"✓ Workspaces: {data['total']} total")


class TestAdminMessages:
    """Admin messages endpoint tests"""
    
    def test_get_messages_stats(self, admin_headers):
        """Test GET /api/admin/messages returns message statistics"""
        response = requests.get(f"{BASE_URL}/api/admin/messages", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify message stats structure
        assert "total" in data
        assert "today" in data
        assert "this_week" in data
        assert "this_month" in data
        assert "daily_stats" in data
        
        assert isinstance(data["daily_stats"], list)
        if data["daily_stats"]:
            assert "date" in data["daily_stats"][0]
            assert "count" in data["daily_stats"][0]
        
        print(f"✓ Messages: {data['total']} total, {data['today']} today")


class TestAdminRecentSignups:
    """Admin recent signups endpoint tests"""
    
    def test_get_recent_signups(self, admin_headers):
        """Test GET /api/admin/recent-signups returns recent signups"""
        response = requests.get(f"{BASE_URL}/api/admin/recent-signups", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            user = data[0]
            assert "id" in user
            assert "email" in user
            assert "full_name" in user
            assert "created_at" in user
        
        print(f"✓ Recent signups: {len(data)} users")


class TestAdminTopWorkspaces:
    """Admin top workspaces endpoint tests"""
    
    def test_get_top_workspaces(self, admin_headers):
        """Test GET /api/admin/top-workspaces returns top workspaces"""
        response = requests.get(f"{BASE_URL}/api/admin/top-workspaces", headers=admin_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list)
        if data:
            ws = data[0]
            assert "id" in ws
            assert "name" in ws
            assert "owner" in ws
            assert "messages_this_month" in ws
        
        print(f"✓ Top workspaces: {len(data)} workspaces")


class TestAdminSecurity:
    """Admin security tests - non-admin users should be blocked"""
    
    def test_non_admin_blocked_from_stats(self, demo_headers):
        """Test non-admin user blocked from /api/admin/stats with 403"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=demo_headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin blocked from /api/admin/stats")
    
    def test_non_admin_blocked_from_users(self, demo_headers):
        """Test non-admin user blocked from /api/admin/users with 403"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers=demo_headers)
        assert response.status_code == 403
        print("✓ Non-admin blocked from /api/admin/users")
    
    def test_non_admin_blocked_from_revenues(self, demo_headers):
        """Test non-admin user blocked from /api/admin/revenues with 403"""
        response = requests.get(f"{BASE_URL}/api/admin/revenues", headers=demo_headers)
        assert response.status_code == 403
        print("✓ Non-admin blocked from /api/admin/revenues")
    
    def test_non_admin_blocked_from_workspaces(self, demo_headers):
        """Test non-admin user blocked from /api/admin/workspaces with 403"""
        response = requests.get(f"{BASE_URL}/api/admin/workspaces", headers=demo_headers)
        assert response.status_code == 403
        print("✓ Non-admin blocked from /api/admin/workspaces")
    
    def test_non_admin_blocked_from_messages(self, demo_headers):
        """Test non-admin user blocked from /api/admin/messages with 403"""
        response = requests.get(f"{BASE_URL}/api/admin/messages", headers=demo_headers)
        assert response.status_code == 403
        print("✓ Non-admin blocked from /api/admin/messages")
    
    def test_unauthenticated_blocked_from_admin(self):
        """Test unauthenticated request blocked from admin endpoints"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code in [401, 403]
        print("✓ Unauthenticated request blocked from admin endpoints")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
