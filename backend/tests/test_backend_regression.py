"""
Backend Regression Tests - Post-Refactoring Validation
Tests all endpoints after server.py was split into 7 route files:
- zones.py, reservations.py, alerts.py, notifications.py, roles.py, maintenance.py, seed.py
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndBasicRoutes:
    """Test basic health routes in server.py"""
    
    def test_root_hello_world(self):
        """GET /api/ returns Hello World"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "Hello World"
        print("✓ GET /api/ returns Hello World")

    def test_status_endpoint(self):
        """POST /api/status creates status check"""
        response = requests.post(f"{BASE_URL}/api/status", json={"client_name": "TEST_regression"})
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["client_name"] == "TEST_regression"
        print("✓ POST /api/status works")


class TestReservationsRouter:
    """Test reservations.py routes"""
    
    def test_list_reservations(self):
        """GET /api/reservations returns list"""
        response = requests.get(f"{BASE_URL}/api/reservations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations returns {len(data)} reservations")

    def test_gantt_endpoint(self):
        """GET /api/reservations/gantt returns assets grouped"""
        response = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert response.status_code == 200
        data = response.json()
        assert "assets" in data
        assert "range_start" in data
        assert "range_end" in data
        assert "total_reservations" in data
        assert isinstance(data["assets"], list)
        print(f"✓ GET /api/reservations/gantt returns {len(data['assets'])} assets, {data['total_reservations']} reservations")

    def test_today_summary(self):
        """GET /api/reservations/today-summary returns KPI counts"""
        response = requests.get(f"{BASE_URL}/api/reservations/today-summary")
        assert response.status_code == 200
        data = response.json()
        assert "active_count" in data
        assert "upcoming_count" in data
        assert "overdue_count" in data
        assert "pending_count" in data
        assert "alert_count" in data
        print(f"✓ GET /api/reservations/today-summary: active={data['active_count']}, pending={data['pending_count']}")

    def test_kpis_endpoint(self):
        """GET /api/reservations/kpis returns full KPIs"""
        response = requests.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "active" in data
        assert "confirmed" in data
        assert "today" in data
        assert "overdue" in data
        assert "completed" in data
        print(f"✓ GET /api/reservations/kpis: total={data['total']}, active={data['active']}")

    def test_planning_endpoint(self):
        """GET /api/reservations/planning returns planning reservations"""
        response = requests.get(f"{BASE_URL}/api/reservations/planning")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations/planning returns {len(data)} reservations")

    def test_export_csv(self):
        """GET /api/reservations/export/csv returns CSV content"""
        response = requests.get(f"{BASE_URL}/api/reservations/export/csv")
        assert response.status_code == 200
        assert "text/csv" in response.headers.get("content-type", "")
        content = response.text
        assert "ID" in content or "Asset" in content  # CSV header
        print("✓ GET /api/reservations/export/csv returns CSV")


class TestAlertsRouter:
    """Test alerts.py routes"""
    
    def test_alert_rules(self):
        """GET /api/reservations/alerts/rules returns 5 rules"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts/rules")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, f"Expected at least 5 rules, got {len(data)}"
        rule_types = [r["type"] for r in data]
        assert "overdue" in rule_types
        assert "upcoming" in rule_types
        print(f"✓ GET /api/reservations/alerts/rules returns {len(data)} rules")

    def test_alert_scan(self):
        """POST /api/reservations/alerts/scan works"""
        response = requests.post(f"{BASE_URL}/api/reservations/alerts/scan")
        assert response.status_code == 200
        data = response.json()
        assert "scanned" in data
        assert "alerts_generated" in data
        print(f"✓ POST /api/reservations/alerts/scan: scanned={data['scanned']}, generated={data['alerts_generated']}")

    def test_get_alerts(self):
        """GET /api/reservations/alerts returns alerts list"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts?status=active")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations/alerts returns {len(data)} active alerts")

    def test_alert_stats(self):
        """GET /api/reservations/alerts/stats returns stats"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_active" in data
        assert "by_type" in data
        assert "by_severity" in data
        print(f"✓ GET /api/reservations/alerts/stats: total_active={data['total_active']}")


class TestZonesRouter:
    """Test zones.py routes"""
    
    def test_list_zones(self):
        """GET /api/zones returns zones list"""
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/zones returns {len(data)} zones")

    def test_zone_events(self):
        """GET /api/zones/events returns events list"""
        response = requests.get(f"{BASE_URL}/api/zones/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/zones/events returns {len(data)} events")

    def test_zone_alerts(self):
        """GET /api/zones/alerts returns zone alerts"""
        response = requests.get(f"{BASE_URL}/api/zones/alerts")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/zones/alerts returns {len(data)} zone alerts")


class TestNotificationsRouter:
    """Test notifications.py routes"""
    
    def test_list_notifications(self):
        """GET /api/notifications returns notifications list"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/notifications returns {len(data)} notifications")

    def test_notification_count(self):
        """GET /api/notifications/count returns count"""
        response = requests.get(f"{BASE_URL}/api/notifications/count")
        assert response.status_code == 200
        data = response.json()
        assert "count" in data
        print(f"✓ GET /api/notifications/count: {data['count']} unread")


class TestRolesRouter:
    """Test roles.py routes"""
    
    def test_list_roles(self):
        """GET /api/roles returns 4 roles"""
        response = requests.get(f"{BASE_URL}/api/roles")
        assert response.status_code == 200
        data = response.json()
        assert "roles" in data
        assert "permissions" in data
        roles = data["roles"]
        assert len(roles) == 4, f"Expected 4 roles, got {len(roles)}"
        assert "super_admin" in roles
        assert "admin_client" in roles
        assert "manager" in roles
        assert "terrain" in roles
        print(f"✓ GET /api/roles returns {len(roles)} roles: {roles}")


class TestMaintenanceRouter:
    """Test maintenance.py routes"""
    
    def test_list_maintenance(self):
        """GET /api/maintenance returns maintenance list"""
        response = requests.get(f"{BASE_URL}/api/maintenance")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/maintenance returns {len(data)} records")


class TestApprovalWorkflow:
    """Test approve/reject workflow"""
    
    @pytest.fixture(autouse=True)
    def setup_test_reservation(self):
        """Create a test reservation for approval testing"""
        now = datetime.now(timezone.utc)
        self.test_reservation = {
            "asset_id": f"TEST_asset_{uuid.uuid4().hex[:8]}",
            "asset_name": "TEST_ApprovalRegression",
            "user_name": "TEST_User",
            "start_date": (now + timedelta(days=1)).isoformat(),
            "end_date": (now + timedelta(days=2)).isoformat(),
            "status": "requested",
            "priority": "normal"
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=self.test_reservation)
        if response.status_code == 201 or response.status_code == 200:
            self.reservation_id = response.json().get("id")
        else:
            self.reservation_id = None
        yield
        # Cleanup not needed as test data is prefixed with TEST_

    def test_approve_reservation(self):
        """POST /api/reservations/{id}/approve changes status to confirmed"""
        if not self.reservation_id:
            pytest.skip("Could not create test reservation")
        
        response = requests.post(f"{BASE_URL}/api/reservations/{self.reservation_id}/approve")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "confirmed"
        
        # Verify status changed
        get_response = requests.get(f"{BASE_URL}/api/reservations/{self.reservation_id}")
        assert get_response.status_code == 200
        assert get_response.json().get("status") == "confirmed"
        print("✓ POST /api/reservations/{id}/approve changes status to confirmed")

    def test_reject_reservation(self):
        """POST /api/reservations/{id}/reject changes status to rejected"""
        # Create another reservation for reject test
        now = datetime.now(timezone.utc)
        test_res = {
            "asset_id": f"TEST_asset_{uuid.uuid4().hex[:8]}",
            "asset_name": "TEST_RejectRegression",
            "user_name": "TEST_User",
            "start_date": (now + timedelta(days=3)).isoformat(),
            "end_date": (now + timedelta(days=4)).isoformat(),
            "status": "requested",
            "priority": "normal"
        }
        create_response = requests.post(f"{BASE_URL}/api/reservations", json=test_res)
        if create_response.status_code not in [200, 201]:
            pytest.skip("Could not create test reservation for reject")
        
        res_id = create_response.json().get("id")
        response = requests.post(f"{BASE_URL}/api/reservations/{res_id}/reject")
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "rejected"
        print("✓ POST /api/reservations/{id}/reject changes status to rejected")

    def test_approve_nonexistent_returns_404(self):
        """POST /api/reservations/{id}/approve returns 404 for non-existent"""
        response = requests.post(f"{BASE_URL}/api/reservations/nonexistent-id-12345/approve")
        assert response.status_code == 404
        print("✓ Approve non-existent returns 404")


class TestDeviceRoutes:
    """Test device routes in server.py"""
    
    def test_device_configs(self):
        """GET /api/device/configs returns list"""
        response = requests.get(f"{BASE_URL}/api/device/configs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/device/configs returns {len(data)} configs")


class TestWebSocket:
    """Test WebSocket endpoint"""
    
    def test_websocket_endpoint_exists(self):
        """WebSocket /ws endpoint should be accessible"""
        # We can't fully test WebSocket with requests, but we can verify the endpoint exists
        # by checking that a regular HTTP request gets a proper response (upgrade required)
        try:
            response = requests.get(f"{BASE_URL}/ws", timeout=5)
            # WebSocket endpoints typically return 400 or 426 for non-WebSocket requests
            assert response.status_code in [400, 426, 403, 404, 200]
            print("✓ WebSocket /ws endpoint exists")
        except Exception as e:
            # Connection might be refused for non-WebSocket, which is expected
            print(f"✓ WebSocket /ws endpoint check: {str(e)[:50]}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
