"""
WAZA Grow Module - Backend API Tests
Tests for: Feature flags, Waitlist, Plans, Subscription, FB Account, Campaigns, Admin endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@waza.africa"
ADMIN_PASSWORD = "WazaAdmin2026!"
DEMO_EMAIL = "demo@waza.africa"
DEMO_PASSWORD = "Password123!"


class TestGrowFeatureFlags:
    """Test /api/grow/feature-flags endpoint (PUBLIC)"""
    
    def test_get_feature_flags_public(self):
        """Feature flags should be accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/grow/feature-flags")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "grow_enabled" in data
        assert "grow_beta" in data
        assert isinstance(data["grow_enabled"], bool)
        assert isinstance(data["grow_beta"], bool)
        print(f"✓ Feature flags: grow_enabled={data['grow_enabled']}, grow_beta={data['grow_beta']}")


class TestGrowWaitlist:
    """Test /api/grow/waitlist endpoints (PUBLIC)"""
    
    def test_get_waitlist_count(self):
        """Waitlist count should be accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/grow/waitlist/count")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "count" in data
        assert isinstance(data["count"], int)
        assert data["count"] >= 127  # Social proof padding
        print(f"✓ Waitlist count: {data['count']}")
    
    def test_join_waitlist(self):
        """Should be able to join waitlist"""
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        response = requests.post(f"{BASE_URL}/api/grow/waitlist", json={
            "email": test_email,
            "name": "Test User",
            "company": "Test Company"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "message" in data
        print(f"✓ Joined waitlist: {data['message']}")
    
    def test_join_waitlist_duplicate(self):
        """Duplicate email should return already_registered"""
        test_email = f"duplicate_{uuid.uuid4().hex[:8]}@example.com"
        # First join
        requests.post(f"{BASE_URL}/api/grow/waitlist", json={"email": test_email})
        # Second join (duplicate)
        response = requests.post(f"{BASE_URL}/api/grow/waitlist", json={"email": test_email})
        assert response.status_code == 200
        data = response.json()
        assert data.get("already_registered") == True
        print(f"✓ Duplicate waitlist handled correctly")


class TestGrowPlans:
    """Test /api/grow/plans endpoint (PUBLIC)"""
    
    def test_get_plans(self):
        """Plans should be accessible without auth"""
        response = requests.get(f"{BASE_URL}/api/grow/plans")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "plans" in data
        plans = data["plans"]
        # Verify plan structure
        assert "starter" in plans
        assert "pro" in plans
        assert "agency" in plans
        # Verify pricing
        assert plans["starter"]["price_fcfa"] == 15000
        assert plans["pro"]["price_fcfa"] == 35000
        assert plans["agency"]["price_fcfa"] == 75000
        print(f"✓ Plans: Starter={plans['starter']['price_fcfa']}, Pro={plans['pro']['price_fcfa']}, Agency={plans['agency']['price_fcfa']} FCFA")


class TestGrowAuthenticatedEndpoints:
    """Test authenticated Grow endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_subscription_no_sub(self):
        """Get subscription when user has none"""
        response = requests.get(f"{BASE_URL}/api/grow/subscription", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        # May or may not have subscription
        print(f"✓ Subscription status: {data.get('subscription')}")
    
    def test_get_fb_account(self):
        """Get Facebook account status"""
        response = requests.get(f"{BASE_URL}/api/grow/fb-account", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        print(f"✓ FB Account: {data.get('account')}")
    
    def test_get_campaigns(self):
        """Get campaigns list"""
        response = requests.get(f"{BASE_URL}/api/grow/campaigns", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "campaigns" in data
        assert isinstance(data["campaigns"], list)
        print(f"✓ Campaigns count: {len(data['campaigns'])}")
    
    def test_get_overview(self):
        """Get Grow overview stats"""
        response = requests.get(f"{BASE_URL}/api/grow/overview", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_campaigns" in data
        assert "active_campaigns" in data
        assert "total_spend" in data
        print(f"✓ Overview: {data['total_campaigns']} campaigns, {data['total_spend']} FCFA spent")
    
    def test_connect_fb_account(self):
        """Connect Facebook account (mock)"""
        response = requests.post(f"{BASE_URL}/api/grow/fb-account/connect", headers=self.headers, json={
            "fb_account_id": f"act_test_{uuid.uuid4().hex[:8]}",
            "fb_account_name": "Test FB Account",
            "access_token": f"mock_token_{uuid.uuid4().hex}"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ FB Connect: {data['message']}")
    
    def test_disconnect_fb_account(self):
        """Disconnect Facebook account"""
        response = requests.post(f"{BASE_URL}/api/grow/fb-account/disconnect", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ FB Disconnect: {data['message']}")


class TestGrowCampaignCRUD:
    """Test campaign CRUD operations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_create_campaign(self):
        """Create a new campaign"""
        campaign_name = f"TEST_Campaign_{uuid.uuid4().hex[:6]}"
        response = requests.post(f"{BASE_URL}/api/grow/campaigns", headers=self.headers, json={
            "name": campaign_name,
            "objective": "conversions",
            "budget_fcfa": 10000,
            "budget_type": "daily",
            "target_audience": {"age_min": 18, "age_max": 45, "locations": ["Douala", "Yaounde"]},
            "ad_creative": {"headline": "Test Headline", "description": "Test Description"}
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "campaign_id" in data
        assert "message" in data
        print(f"✓ Campaign created: {data['campaign_id']}")
        return data["campaign_id"]
    
    def test_get_campaign_detail(self):
        """Get campaign detail after creation"""
        # First create a campaign
        campaign_name = f"TEST_Detail_{uuid.uuid4().hex[:6]}"
        create_resp = requests.post(f"{BASE_URL}/api/grow/campaigns", headers=self.headers, json={
            "name": campaign_name,
            "objective": "traffic",
            "budget_fcfa": 5000,
            "budget_type": "daily"
        })
        if create_resp.status_code != 200:
            pytest.skip("Campaign creation failed")
        campaign_id = create_resp.json()["campaign_id"]
        
        # Get detail
        response = requests.get(f"{BASE_URL}/api/grow/campaigns/{campaign_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == campaign_name
        assert data["objective"] == "traffic"
        assert data["budget_fcfa"] == 5000
        print(f"✓ Campaign detail: {data['name']}, objective={data['objective']}")
    
    def test_update_campaign_status(self):
        """Update campaign status to active (generates mock results)"""
        # Create campaign
        create_resp = requests.post(f"{BASE_URL}/api/grow/campaigns", headers=self.headers, json={
            "name": f"TEST_Status_{uuid.uuid4().hex[:6]}",
            "objective": "awareness",
            "budget_fcfa": 8000,
            "budget_type": "daily"
        })
        if create_resp.status_code != 200:
            pytest.skip("Campaign creation failed")
        campaign_id = create_resp.json()["campaign_id"]
        
        # Update status to active
        response = requests.put(f"{BASE_URL}/api/grow/campaigns/{campaign_id}/status?status=active", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "active"
        print(f"✓ Campaign status updated to: {data['status']}")
        
        # Verify results were generated
        detail_resp = requests.get(f"{BASE_URL}/api/grow/campaigns/{campaign_id}", headers=self.headers)
        detail = detail_resp.json()
        assert "results" in detail
        if detail["results"]:
            print(f"✓ Mock results generated: impressions={detail['results'].get('impressions')}, clicks={detail['results'].get('clicks')}")


class TestGrowAICreative:
    """Test AI creative generation"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_generate_creative(self):
        """Generate AI creative suggestions"""
        response = requests.post(f"{BASE_URL}/api/grow/generate-creative", headers=self.headers, json={
            "product_name": "Boutique Mode Africaine",
            "product_description": "Vetements traditionnels africains modernes",
            "objective": "conversions"
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "headlines" in data
        assert "descriptions" in data
        assert len(data["headlines"]) >= 1
        assert len(data["descriptions"]) >= 1
        print(f"✓ AI Creative generated: {len(data['headlines'])} headlines, {len(data['descriptions'])} descriptions")
        print(f"  Sample headline: {data['headlines'][0]}")


class TestAdminFeatureFlags:
    """Test admin feature flag endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_admin_feature_flags(self):
        """Admin can get feature flags"""
        response = requests.get(f"{BASE_URL}/api/admin/feature-flags", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        print(f"✓ Admin feature flags: {data}")
    
    def test_update_feature_flags(self):
        """Admin can update feature flags"""
        # Get current state
        get_resp = requests.get(f"{BASE_URL}/api/admin/feature-flags", headers=self.headers)
        current = get_resp.json()
        
        # Toggle grow_beta
        new_beta = not current.get("grow_beta", False)
        response = requests.put(f"{BASE_URL}/api/admin/feature-flags", headers=self.headers, json={
            "grow_beta": new_beta
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "updated" in data
        print(f"✓ Feature flags updated: {data['updated']}")
        
        # Restore original state
        requests.put(f"{BASE_URL}/api/admin/feature-flags", headers=self.headers, json={
            "grow_beta": current.get("grow_beta", False)
        })


class TestAdminGrowStats:
    """Test admin Grow stats endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_grow_stats(self):
        """Admin can get Grow stats"""
        response = requests.get(f"{BASE_URL}/api/admin/grow-stats", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total_subscribers" in data
        assert "active_subscribers" in data
        assert "total_campaigns" in data
        assert "waitlist_count" in data
        assert "grow_mrr" in data
        print(f"✓ Grow stats: {data['active_subscribers']} active subs, {data['total_campaigns']} campaigns, {data['waitlist_count']} waitlist")


class TestAdminWaitlist:
    """Test admin waitlist management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login as admin"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code != 200:
            pytest.skip(f"Admin login failed: {response.text}")
        data = response.json()
        self.token = data.get("access_token")
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_waitlist(self):
        """Admin can get waitlist entries"""
        response = requests.get(f"{BASE_URL}/api/admin/waitlist", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert "total" in data
        assert "entries" in data
        assert isinstance(data["entries"], list)
        print(f"✓ Admin waitlist: {data['total']} entries")
    
    def test_export_waitlist_csv(self):
        """Admin can export waitlist as CSV"""
        response = requests.get(f"{BASE_URL}/api/admin/waitlist/export-csv", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        assert "text/csv" in response.headers.get("content-type", "")
        print(f"✓ Waitlist CSV export successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
