"""
Test suite for WAZA Admin New Features:
1. Advanced Analytics endpoint
2. Audit Log endpoint
3. PDF Export endpoints (users and revenues)
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@waza.africa"
ADMIN_PASSWORD = "WazaAdmin2026!"
USER_EMAIL = "demo@waza.africa"
USER_PASSWORD = "Password123!"


class TestAdminAuth:
    """Test admin authentication for new features"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        return data["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        """Get headers with admin auth"""
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_admin_login_success(self):
        """Test admin can login successfully"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data.get("user", {}).get("is_superadmin") == True


class TestAdvancedAnalytics:
    """Test GET /api/admin/analytics/advanced endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_advanced_analytics_returns_200(self, admin_headers):
        """Test advanced analytics endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_advanced_analytics_has_conversion_rate(self, admin_headers):
        """Test response contains conversion_rate"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "conversion_rate" in data, "Missing conversion_rate field"
        assert isinstance(data["conversion_rate"], (int, float))
    
    def test_advanced_analytics_has_retention_rate(self, admin_headers):
        """Test response contains retention_rate"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "retention_rate" in data, "Missing retention_rate field"
        assert isinstance(data["retention_rate"], (int, float))
    
    def test_advanced_analytics_has_signup_trend(self, admin_headers):
        """Test response contains signup_trend array with 30 days"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "signup_trend" in data, "Missing signup_trend field"
        assert isinstance(data["signup_trend"], list)
        assert len(data["signup_trend"]) == 30, f"Expected 30 days, got {len(data['signup_trend'])}"
        # Check structure of each entry
        if data["signup_trend"]:
            entry = data["signup_trend"][0]
            assert "date" in entry
            assert "signups" in entry
    
    def test_advanced_analytics_has_conversion_funnel(self, admin_headers):
        """Test response contains conversion_funnel with plan stages"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "conversion_funnel" in data, "Missing conversion_funnel field"
        assert isinstance(data["conversion_funnel"], list)
        # Should have 4 stages: Free, Starter, Pro, Business
        assert len(data["conversion_funnel"]) == 4
        stages = [f["stage"] for f in data["conversion_funnel"]]
        assert "Free" in stages
        assert "Starter" in stages
        assert "Pro" in stages
        assert "Business" in stages
    
    def test_advanced_analytics_has_top_agents(self, admin_headers):
        """Test response contains top_agents array"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "top_agents" in data, "Missing top_agents field"
        assert isinstance(data["top_agents"], list)
    
    def test_advanced_analytics_has_activity_heatmap(self, admin_headers):
        """Test response contains activity_heatmap with 24 hours"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "activity_heatmap" in data, "Missing activity_heatmap field"
        assert isinstance(data["activity_heatmap"], list)
        assert len(data["activity_heatmap"]) == 24, f"Expected 24 hours, got {len(data['activity_heatmap'])}"
    
    def test_advanced_analytics_has_countries(self, admin_headers):
        """Test response contains countries distribution"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "countries" in data, "Missing countries field"
        assert isinstance(data["countries"], list)
    
    def test_advanced_analytics_has_user_counts(self, admin_headers):
        """Test response contains total_users and paid_users"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced", headers=admin_headers)
        data = response.json()
        assert "total_users" in data
        assert "paid_users" in data
        assert isinstance(data["total_users"], int)
        assert isinstance(data["paid_users"], int)


class TestAuditLogs:
    """Test GET /api/admin/audit-logs endpoint"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_audit_logs_returns_200(self, admin_headers):
        """Test audit logs endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_audit_logs_has_pagination(self, admin_headers):
        """Test response contains pagination fields"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs", headers=admin_headers)
        data = response.json()
        assert "total" in data, "Missing total field"
        assert "page" in data, "Missing page field"
        assert "logs" in data, "Missing logs field"
        assert isinstance(data["logs"], list)
    
    def test_audit_logs_entry_structure(self, admin_headers):
        """Test audit log entries have correct structure"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs", headers=admin_headers)
        data = response.json()
        if data["logs"]:
            log = data["logs"][0]
            assert "id" in log
            assert "admin_email" in log
            assert "action" in log
            assert "created_at" in log
    
    def test_audit_logs_filter_by_action(self, admin_headers):
        """Test filtering audit logs by action"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs?action_filter=export", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        # All returned logs should contain 'export' in action
        for log in data["logs"]:
            assert "export" in log["action"].lower(), f"Filter not working: {log['action']}"
    
    def test_audit_logs_pagination_params(self, admin_headers):
        """Test pagination parameters work"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs?page=1&limit=10", headers=admin_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["page"] == 1
        assert len(data["logs"]) <= 10


class TestPDFExport:
    """Test PDF export endpoints"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_export_users_pdf_returns_200(self, admin_headers):
        """Test users PDF export returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/export/users-pdf", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_export_users_pdf_content_type(self, admin_headers):
        """Test users PDF export returns PDF content type"""
        response = requests.get(f"{BASE_URL}/api/admin/export/users-pdf", headers=admin_headers)
        assert "application/pdf" in response.headers.get("content-type", ""), f"Expected PDF, got {response.headers.get('content-type')}"
    
    def test_export_users_pdf_has_content_disposition(self, admin_headers):
        """Test users PDF export has download filename"""
        response = requests.get(f"{BASE_URL}/api/admin/export/users-pdf", headers=admin_headers)
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp
        assert "waza_users_report.pdf" in content_disp
    
    def test_export_users_pdf_valid_pdf(self, admin_headers):
        """Test users PDF export returns valid PDF (starts with %PDF)"""
        response = requests.get(f"{BASE_URL}/api/admin/export/users-pdf", headers=admin_headers)
        # PDF files start with %PDF
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF"
    
    def test_export_revenues_pdf_returns_200(self, admin_headers):
        """Test revenues PDF export returns 200"""
        response = requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf", headers=admin_headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    
    def test_export_revenues_pdf_content_type(self, admin_headers):
        """Test revenues PDF export returns PDF content type"""
        response = requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf", headers=admin_headers)
        assert "application/pdf" in response.headers.get("content-type", "")
    
    def test_export_revenues_pdf_has_content_disposition(self, admin_headers):
        """Test revenues PDF export has download filename"""
        response = requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf", headers=admin_headers)
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp
        assert "waza_revenues_report.pdf" in content_disp
    
    def test_export_revenues_pdf_valid_pdf(self, admin_headers):
        """Test revenues PDF export returns valid PDF"""
        response = requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf", headers=admin_headers)
        assert response.content[:4] == b'%PDF', "Response is not a valid PDF"


class TestPDFExportCreatesAuditLog:
    """Test that PDF exports create audit log entries"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        return response.json()["access_token"]
    
    @pytest.fixture(scope="class")
    def admin_headers(self, admin_token):
        return {"Authorization": f"Bearer {admin_token}"}
    
    def test_users_pdf_export_creates_audit_log(self, admin_headers):
        """Test that exporting users PDF creates an audit log entry"""
        # Get current audit log count
        before = requests.get(f"{BASE_URL}/api/admin/audit-logs?action_filter=export_users_pdf", headers=admin_headers)
        before_count = before.json()["total"]
        
        # Export PDF
        requests.get(f"{BASE_URL}/api/admin/export/users-pdf", headers=admin_headers)
        
        # Check audit log increased
        after = requests.get(f"{BASE_URL}/api/admin/audit-logs?action_filter=export_users_pdf", headers=admin_headers)
        after_count = after.json()["total"]
        
        assert after_count > before_count, "PDF export did not create audit log entry"
    
    def test_revenues_pdf_export_creates_audit_log(self, admin_headers):
        """Test that exporting revenues PDF creates an audit log entry"""
        # Get current audit log count
        before = requests.get(f"{BASE_URL}/api/admin/audit-logs?action_filter=export_revenues_pdf", headers=admin_headers)
        before_count = before.json()["total"]
        
        # Export PDF
        requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf", headers=admin_headers)
        
        # Check audit log increased
        after = requests.get(f"{BASE_URL}/api/admin/audit-logs?action_filter=export_revenues_pdf", headers=admin_headers)
        after_count = after.json()["total"]
        
        assert after_count > before_count, "PDF export did not create audit log entry"


class TestNonAdminAccess:
    """Test that non-admin users get 403 on admin endpoints"""
    
    def test_analytics_requires_admin(self):
        """Test advanced analytics returns 401/403 without admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/advanced")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_audit_logs_requires_admin(self):
        """Test audit logs returns 401/403 without admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/audit-logs")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_export_users_pdf_requires_admin(self):
        """Test users PDF export returns 401/403 without admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/export/users-pdf")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_export_revenues_pdf_requires_admin(self):
        """Test revenues PDF export returns 401/403 without admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/export/revenues-pdf")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
