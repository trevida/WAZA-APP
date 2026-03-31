"""
Test Suite for Broadcast A/B Testing and Scheduled Broadcasts Features
Tests: Standard broadcasts, A/B broadcasts, scheduled broadcasts, validation, stats, delete, cancel
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
DEMO_USER = {"email": "demo@waza.africa", "password": "Password123!"}
WORKSPACE_ID = "8b3f3dba-bf3d-4f49-8fce-a0451be35467"


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for demo user"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json=DEMO_USER)
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip(f"Authentication failed: {response.status_code} - {response.text}")


@pytest.fixture(scope="module")
def api_client(auth_token):
    """Authenticated requests session"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {auth_token}"
    })
    return session


class TestBroadcastCreate:
    """Test broadcast creation endpoints"""

    def test_create_standard_broadcast_draft(self, api_client):
        """Test 1: Create standard broadcast (status=draft)"""
        payload = {
            "message_template": "TEST_Standard broadcast message for testing",
            "target_tags": [],
            "ab_test_enabled": False
        }
        response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "draft"
        assert data["message_template"] == payload["message_template"]
        assert data["ab_test_enabled"] == False
        assert data["variant_b_template"] is None
        assert data["scheduled_at"] is None
        print(f"✓ Standard broadcast created with ID: {data['id']}, status: {data['status']}")
        return data["id"]

    def test_create_ab_broadcast(self, api_client):
        """Test 2: Create A/B broadcast with ab_test_enabled=true + variant_b_template"""
        payload = {
            "message_template": "TEST_Variante A: Bonjour, decouvrez notre offre!",
            "target_tags": [],
            "ab_test_enabled": True,
            "variant_b_template": "TEST_Variante B: Salut! Profitez de notre promo!"
        }
        response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "draft"
        assert data["ab_test_enabled"] == True
        assert data["variant_b_template"] == payload["variant_b_template"]
        assert data["message_template"] == payload["message_template"]
        print(f"✓ A/B broadcast created with ID: {data['id']}, ab_test_enabled: {data['ab_test_enabled']}")
        return data["id"]

    def test_create_scheduled_broadcast(self, api_client):
        """Test 3: Create scheduled broadcast with future scheduled_at (status=scheduled)"""
        future_time = (datetime.utcnow() + timedelta(hours=2)).isoformat() + "Z"
        payload = {
            "message_template": "TEST_Scheduled broadcast for later",
            "target_tags": [],
            "ab_test_enabled": False,
            "scheduled_at": future_time
        }
        response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["status"] == "scheduled"
        assert data["scheduled_at"] is not None
        print(f"✓ Scheduled broadcast created with ID: {data['id']}, status: {data['status']}, scheduled_at: {data['scheduled_at']}")
        return data["id"]

    def test_reject_past_scheduled_at(self, api_client):
        """Test 4: Reject past scheduled_at date (422)"""
        past_time = (datetime.utcnow() - timedelta(hours=1)).isoformat() + "Z"
        payload = {
            "message_template": "TEST_This should fail - past date",
            "target_tags": [],
            "ab_test_enabled": False,
            "scheduled_at": past_time
        }
        response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        data = response.json()
        assert "futur" in data.get("detail", "").lower() or "future" in data.get("detail", "").lower()
        print(f"✓ Past scheduled_at correctly rejected with 422: {data.get('detail')}")

    def test_reject_ab_without_variant_b(self, api_client):
        """Test 5: Reject A/B without variant_b_template (422)"""
        payload = {
            "message_template": "TEST_A/B without variant B",
            "target_tags": [],
            "ab_test_enabled": True,
            "variant_b_template": None  # Missing variant B
        }
        response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        
        assert response.status_code == 422, f"Expected 422, got {response.status_code}: {response.text}"
        data = response.json()
        assert "variante" in data.get("detail", "").lower() or "variant" in data.get("detail", "").lower()
        print(f"✓ A/B without variant_b correctly rejected with 422: {data.get('detail')}")


class TestBroadcastSend:
    """Test broadcast send endpoint"""

    def test_send_broadcast(self, api_client):
        """Test 6: Send broadcast (queues background task)"""
        # First create a broadcast
        payload = {
            "message_template": "TEST_Broadcast to send immediately",
            "target_tags": [],
            "ab_test_enabled": False
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        
        # Now send it
        send_response = api_client.post(f"{BASE_URL}/api/broadcasts/{broadcast_id}/send")
        
        assert send_response.status_code == 200, f"Expected 200, got {send_response.status_code}: {send_response.text}"
        data = send_response.json()
        assert "broadcast_id" in data
        assert data["broadcast_id"] == broadcast_id
        print(f"✓ Broadcast sent: {data}")
        return broadcast_id


class TestBroadcastStats:
    """Test broadcast stats endpoint"""

    def test_get_stats_standard(self, api_client):
        """Test 7a: Get stats for standard broadcast"""
        # Create and send a broadcast first
        payload = {
            "message_template": "TEST_Stats test broadcast",
            "target_tags": [],
            "ab_test_enabled": False
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        
        # Send it
        api_client.post(f"{BASE_URL}/api/broadcasts/{broadcast_id}/send")
        
        # Get stats
        stats_response = api_client.get(f"{BASE_URL}/api/broadcasts/{broadcast_id}/stats")
        
        assert stats_response.status_code == 200, f"Expected 200, got {stats_response.status_code}: {stats_response.text}"
        data = stats_response.json()
        assert "total_sent" in data
        assert "total_delivered" in data
        assert "delivery_rate" in data
        assert data["ab_test"] is None  # Standard broadcast has no A/B data
        print(f"✓ Standard broadcast stats: sent={data['total_sent']}, delivered={data['total_delivered']}, rate={data['delivery_rate']}%")

    def test_get_stats_ab_test(self, api_client):
        """Test 7b: Get stats with ab_test data when A/B enabled"""
        # Create A/B broadcast
        payload = {
            "message_template": "TEST_A/B Stats Variante A",
            "target_tags": [],
            "ab_test_enabled": True,
            "variant_b_template": "TEST_A/B Stats Variante B"
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        
        # Send it
        api_client.post(f"{BASE_URL}/api/broadcasts/{broadcast_id}/send")
        
        # Get stats
        stats_response = api_client.get(f"{BASE_URL}/api/broadcasts/{broadcast_id}/stats")
        
        assert stats_response.status_code == 200, f"Expected 200, got {stats_response.status_code}: {stats_response.text}"
        data = stats_response.json()
        assert "ab_test" in data
        
        if data["ab_test"]:
            ab = data["ab_test"]
            assert "variant_a" in ab
            assert "variant_b" in ab
            assert "winner" in ab
            assert "sent" in ab["variant_a"]
            assert "delivered" in ab["variant_a"]
            assert "replied" in ab["variant_a"]
            assert "reply_rate" in ab["variant_a"]
            print(f"✓ A/B broadcast stats: A={ab['variant_a']['reply_rate']}%, B={ab['variant_b']['reply_rate']}%, winner={ab['winner']}")
        else:
            print(f"✓ A/B broadcast stats returned (no contacts to send to): {data}")


class TestBroadcastDelete:
    """Test broadcast delete endpoint"""

    def test_delete_draft_broadcast(self, api_client):
        """Test 8a: Delete draft broadcast"""
        # Create a draft broadcast
        payload = {
            "message_template": "TEST_Draft to delete",
            "target_tags": [],
            "ab_test_enabled": False
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        
        # Delete it
        delete_response = api_client.delete(f"{BASE_URL}/api/broadcasts/{broadcast_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        print(f"✓ Draft broadcast deleted: {broadcast_id}")
        
        # Verify it's gone
        get_response = api_client.get(f"{BASE_URL}/api/broadcasts/{broadcast_id}/stats")
        assert get_response.status_code == 404

    def test_delete_scheduled_broadcast(self, api_client):
        """Test 8b: Delete scheduled broadcast"""
        future_time = (datetime.utcnow() + timedelta(hours=3)).isoformat() + "Z"
        payload = {
            "message_template": "TEST_Scheduled to delete",
            "target_tags": [],
            "ab_test_enabled": False,
            "scheduled_at": future_time
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        
        # Delete it
        delete_response = api_client.delete(f"{BASE_URL}/api/broadcasts/{broadcast_id}")
        
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}: {delete_response.text}"
        print(f"✓ Scheduled broadcast deleted: {broadcast_id}")


class TestBroadcastCancelSchedule:
    """Test cancel scheduled broadcast endpoint"""

    def test_cancel_scheduled_broadcast(self, api_client):
        """Test 9: Cancel scheduled broadcast back to draft"""
        future_time = (datetime.utcnow() + timedelta(hours=4)).isoformat() + "Z"
        payload = {
            "message_template": "TEST_Scheduled to cancel",
            "target_tags": [],
            "ab_test_enabled": False,
            "scheduled_at": future_time
        }
        create_response = api_client.post(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts", json=payload)
        assert create_response.status_code == 201
        broadcast_id = create_response.json()["id"]
        assert create_response.json()["status"] == "scheduled"
        
        # Cancel the schedule
        cancel_response = api_client.post(f"{BASE_URL}/api/broadcasts/{broadcast_id}/cancel-schedule")
        
        assert cancel_response.status_code == 200, f"Expected 200, got {cancel_response.status_code}: {cancel_response.text}"
        data = cancel_response.json()
        assert "annulee" in data.get("message", "").lower() or "cancelled" in data.get("message", "").lower()
        print(f"✓ Scheduled broadcast cancelled: {data}")
        
        # Verify it's now draft by checking stats (which should work for draft)
        # Actually let's list broadcasts and check
        list_response = api_client.get(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts")
        assert list_response.status_code == 200
        broadcasts = list_response.json()
        found = next((b for b in broadcasts if b["id"] == broadcast_id), None)
        if found:
            assert found["status"] == "draft", f"Expected draft, got {found['status']}"
            assert found["scheduled_at"] is None
            print(f"✓ Broadcast status confirmed as draft after cancel")


class TestBroadcastList:
    """Test broadcast list endpoint"""

    def test_list_broadcasts(self, api_client):
        """Test listing broadcasts shows all types"""
        response = api_client.get(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        broadcasts = response.json()
        assert isinstance(broadcasts, list)
        
        # Check that broadcasts have expected fields
        if broadcasts:
            b = broadcasts[0]
            assert "id" in b
            assert "status" in b
            assert "message_template" in b
            assert "ab_test_enabled" in b
            print(f"✓ Listed {len(broadcasts)} broadcasts")
            
            # Count by type
            ab_count = sum(1 for b in broadcasts if b.get("ab_test_enabled"))
            scheduled_count = sum(1 for b in broadcasts if b.get("status") == "scheduled")
            print(f"  - A/B broadcasts: {ab_count}")
            print(f"  - Scheduled broadcasts: {scheduled_count}")
        else:
            print("✓ Broadcast list returned (empty)")


class TestCleanup:
    """Cleanup test data"""

    def test_cleanup_test_broadcasts(self, api_client):
        """Clean up TEST_ prefixed broadcasts"""
        response = api_client.get(f"{BASE_URL}/api/workspaces/{WORKSPACE_ID}/broadcasts")
        if response.status_code == 200:
            broadcasts = response.json()
            deleted = 0
            for b in broadcasts:
                if b.get("message_template", "").startswith("TEST_"):
                    if b.get("status") in ["draft", "scheduled"]:
                        del_response = api_client.delete(f"{BASE_URL}/api/broadcasts/{b['id']}")
                        if del_response.status_code == 200:
                            deleted += 1
            print(f"✓ Cleaned up {deleted} test broadcasts")
