"""
Test Team Collaboration Feature - WAZA SaaS Platform
Tests: Member listing, invitations, role management, invitation acceptance
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://ai-agent-api-1.preview.emergentagent.com')

# Test credentials
DEMO_USER = {"email": "demo@waza.africa", "password": "Password123!"}
ADMIN_USER = {"email": "admin@waza.africa", "password": "WazaAdmin2026!"}
WORKSPACE_ID = "8b3f3dba-bf3d-4f49-8fce-a0451be35467"


@pytest.fixture(scope="module")
def demo_token():
    """Get auth token for demo user (workspace owner)"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=DEMO_USER)
    assert response.status_code == 200, f"Login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def admin_token():
    """Get auth token for admin user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN_USER)
    assert response.status_code == 200, f"Admin login failed: {response.text}"
    return response.json()["access_token"]


@pytest.fixture
def auth_headers(demo_token):
    """Auth headers for demo user"""
    return {"Authorization": f"Bearer {demo_token}"}


@pytest.fixture
def admin_headers(admin_token):
    """Auth headers for admin user"""
    return {"Authorization": f"Bearer {admin_token}"}


class TestListMembers:
    """Test GET /api/workspaces/{id}/members"""

    def test_list_members_returns_owner(self, auth_headers):
        """Members list should include workspace owner"""
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "members" in data
        assert "total" in data
        assert data["total"] >= 1
        
        # Find owner in members list
        owner = next((m for m in data["members"] if m["role"] == "owner"), None)
        assert owner is not None, "Owner should be in members list"
        assert owner["email"] == DEMO_USER["email"]
        assert owner["status"] == "active"

    def test_list_members_includes_invited(self, auth_headers):
        """Members list should include invited members"""
        response = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check structure of member objects
        for member in data["members"]:
            assert "id" in member
            assert "email" in member
            assert "role" in member
            assert "status" in member
            assert member["role"] in ["owner", "admin", "member"]
            assert member["status"] in ["active", "pending"]


class TestInviteMember:
    """Test POST /api/workspaces/{id}/members/invite"""

    def test_invite_member_success(self, auth_headers):
        """Owner can invite a new member"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "message" in data
        assert "member_id" in data
        assert "invite_token" in data
        assert data["status"] == "pending"
        
        # Cleanup - remove the invited member
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{data['member_id']}",
            headers=auth_headers
        )

    def test_invite_admin_role(self, auth_headers):
        """Owner can invite with admin role"""
        unique_email = f"admin_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "admin"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Verify the member was created with admin role
        members_resp = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        members = members_resp.json()["members"]
        invited = next((m for m in members if m["email"] == unique_email), None)
        assert invited is not None
        assert invited["role"] == "admin"
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{data['member_id']}",
            headers=auth_headers
        )

    def test_invite_self_rejected(self, auth_headers):
        """Cannot invite yourself (422)"""
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": DEMO_USER["email"], "role": "member"}
        )
        assert response.status_code == 422
        assert "vous-meme" in response.json()["detail"].lower() or "yourself" in response.json()["detail"].lower()

    def test_invite_duplicate_rejected(self, auth_headers):
        """Cannot invite same email twice (409)"""
        unique_email = f"dup_{uuid.uuid4().hex[:8]}@test.com"
        
        # First invite
        resp1 = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        assert resp1.status_code == 200
        member_id = resp1.json()["member_id"]
        
        # Second invite - should fail
        resp2 = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "admin"}
        )
        assert resp2.status_code == 409
        assert "deja" in resp2.json()["detail"].lower() or "already" in resp2.json()["detail"].lower()
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers
        )

    def test_invite_invalid_role_rejected(self, auth_headers):
        """Invalid role is rejected (422)"""
        unique_email = f"invalid_{uuid.uuid4().hex[:8]}@test.com"
        
        response = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "superadmin"}
        )
        assert response.status_code == 422
        assert "role" in response.json()["detail"].lower()


class TestUpdateMemberRole:
    """Test PUT /api/workspaces/{id}/members/{member_id}"""

    def test_update_role_success(self, auth_headers):
        """Owner can update member role"""
        # Create a member first
        unique_email = f"role_{uuid.uuid4().hex[:8]}@test.com"
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        assert invite_resp.status_code == 200
        member_id = invite_resp.json()["member_id"]
        
        # Update role to admin
        update_resp = requests.put(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers,
            json={"role": "admin"}
        )
        assert update_resp.status_code == 200
        assert "admin" in update_resp.json()["message"].lower()
        
        # Verify the change
        members_resp = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        member = next((m for m in members_resp.json()["members"] if m["id"] == member_id), None)
        assert member is not None
        assert member["role"] == "admin"
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers
        )

    def test_update_role_invalid_rejected(self, auth_headers):
        """Invalid role update is rejected"""
        # Create a member first
        unique_email = f"inv_role_{uuid.uuid4().hex[:8]}@test.com"
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        member_id = invite_resp.json()["member_id"]
        
        # Try invalid role
        update_resp = requests.put(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers,
            json={"role": "owner"}
        )
        assert update_resp.status_code == 422
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers
        )


class TestRemoveMember:
    """Test DELETE /api/workspaces/{id}/members/{member_id}"""

    def test_remove_member_success(self, auth_headers):
        """Owner can remove a member"""
        # Create a member first
        unique_email = f"remove_{uuid.uuid4().hex[:8]}@test.com"
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        member_id = invite_resp.json()["member_id"]
        
        # Remove the member
        delete_resp = requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers
        )
        assert delete_resp.status_code == 200
        assert unique_email in delete_resp.json()["message"]
        
        # Verify removal
        members_resp = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        member = next((m for m in members_resp.json()["members"] if m["id"] == member_id), None)
        assert member is None, "Member should be removed"

    def test_remove_nonexistent_member(self, auth_headers):
        """Removing non-existent member returns 404"""
        fake_id = str(uuid.uuid4())
        response = requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{fake_id}",
            headers=auth_headers
        )
        assert response.status_code == 404


class TestMyInvitations:
    """Test GET /api/workspaces/my-invitations"""

    def test_my_invitations_returns_list(self, admin_headers):
        """Returns list of pending invitations for current user"""
        response = requests.get(
            f"{BASE_URL}/api/workspaces/my-invitations",
            headers=admin_headers
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "invitations" in data
        assert "total" in data
        assert isinstance(data["invitations"], list)


class TestAcceptInvitation:
    """Test POST /api/workspaces/invitations/{token}/accept"""

    def test_accept_invitation_flow(self, auth_headers, admin_headers):
        """Full invitation acceptance flow"""
        # 1. Invite admin user to demo's workspace
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": ADMIN_USER["email"], "role": "member"}
        )
        assert invite_resp.status_code == 200
        invite_token = invite_resp.json()["invite_token"]
        member_id = invite_resp.json()["member_id"]
        
        # 2. Admin user accepts the invitation
        accept_resp = requests.post(
            f"{BASE_URL}/api/workspaces/invitations/{invite_token}/accept",
            headers=admin_headers
        )
        assert accept_resp.status_code == 200
        data = accept_resp.json()
        assert "workspace_id" in data
        assert data["workspace_id"] == WORKSPACE_ID
        
        # 3. Verify admin is now active member
        members_resp = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        admin_member = next(
            (m for m in members_resp.json()["members"] if m["email"] == ADMIN_USER["email"]),
            None
        )
        assert admin_member is not None
        assert admin_member["status"] == "active"
        
        # Cleanup - remove admin from workspace
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{admin_member['id']}",
            headers=auth_headers
        )

    def test_accept_invalid_token(self, admin_headers):
        """Invalid token returns 404"""
        response = requests.post(
            f"{BASE_URL}/api/workspaces/invitations/invalid-token-12345/accept",
            headers=admin_headers
        )
        assert response.status_code == 404

    def test_accept_wrong_user(self, auth_headers, admin_headers):
        """Cannot accept invitation meant for another user"""
        # Create invitation for a different email
        unique_email = f"other_{uuid.uuid4().hex[:8]}@test.com"
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": unique_email, "role": "member"}
        )
        invite_token = invite_resp.json()["invite_token"]
        member_id = invite_resp.json()["member_id"]
        
        # Admin tries to accept (wrong user)
        accept_resp = requests.post(
            f"{BASE_URL}/api/workspaces/invitations/{invite_token}/accept",
            headers=admin_headers
        )
        assert accept_resp.status_code == 403
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{member_id}",
            headers=auth_headers
        )


class TestWorkspacesListIncludesShared:
    """Test GET /api/workspaces returns owned + shared workspaces"""

    def test_workspaces_list_includes_shared(self, auth_headers, admin_headers):
        """After accepting invitation, workspace appears in user's list"""
        # 1. Invite admin to workspace
        invite_resp = requests.post(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/invite",
            headers=auth_headers,
            json={"email": ADMIN_USER["email"], "role": "member"}
        )
        invite_token = invite_resp.json()["invite_token"]
        
        # 2. Accept invitation
        requests.post(
            f"{BASE_URL}/api/workspaces/invitations/{invite_token}/accept",
            headers=admin_headers
        )
        
        # 3. Check admin's workspace list includes the shared workspace
        workspaces_resp = requests.get(
            f"{BASE_URL}/api/workspaces",
            headers=admin_headers
        )
        assert workspaces_resp.status_code == 200
        workspaces = workspaces_resp.json()
        
        shared_ws = next((w for w in workspaces if w["id"] == WORKSPACE_ID), None)
        assert shared_ws is not None, "Shared workspace should appear in user's workspace list"
        
        # Cleanup - get member id and remove
        members_resp = requests.get(
            f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members",
            headers=auth_headers
        )
        admin_member = next(
            (m for m in members_resp.json()["members"] if m["email"] == ADMIN_USER["email"]),
            None
        )
        if admin_member:
            requests.delete(
                f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/members/{admin_member['id']}",
                headers=auth_headers
            )
