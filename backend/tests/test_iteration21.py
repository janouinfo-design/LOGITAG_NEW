"""
Iteration 21 Backend Tests
Testing new features:
1. POST /api/reservations/{id}/cancel - bug fix (decorator was missing)
2. GET /api/reservations/export/csv - CSV export
3. GET /api/roles - roles list and permissions
4. POST /api/roles/assign - assign role to user
5. GET /api/roles/users - list users with roles
6. WebSocket /ws endpoint - connection test
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestCancelEndpointBugFix:
    """Test the cancel endpoint bug fix - decorator was missing at line 463"""
    
    def test_cancel_nonexistent_reservation_returns_404(self):
        """POST /api/reservations/{id}/cancel should return 404 for non-existent ID"""
        fake_id = str(uuid.uuid4())
        response = requests.post(f"{BASE_URL}/api/reservations/{fake_id}/cancel")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}: {response.text}"
        data = response.json()
        assert "detail" in data
        print(f"✓ Cancel non-existent reservation returns 404: {data['detail']}")
    
    def test_cancel_existing_reservation_works(self):
        """POST /api/reservations/{id}/cancel should work for existing confirmed reservation"""
        # First create a reservation
        create_payload = {
            "asset_id": f"TEST-asset-{uuid.uuid4().hex[:8]}",
            "asset_name": "TEST Cancel Asset",
            "user_name": "TEST User",
            "start_date": "2026-02-01T10:00:00",
            "end_date": "2026-02-01T14:00:00",
            "priority": "normal"
        }
        create_res = requests.post(f"{BASE_URL}/api/reservations", json=create_payload)
        assert create_res.status_code == 200, f"Failed to create reservation: {create_res.text}"
        reservation = create_res.json()
        res_id = reservation["id"]
        
        # Now cancel it
        cancel_res = requests.post(f"{BASE_URL}/api/reservations/{res_id}/cancel")
        assert cancel_res.status_code == 200, f"Expected 200, got {cancel_res.status_code}: {cancel_res.text}"
        data = cancel_res.json()
        assert data.get("status") == "cancelled"
        print(f"✓ Cancel existing reservation works: status={data['status']}")
        
        # Verify it's actually cancelled
        get_res = requests.get(f"{BASE_URL}/api/reservations/{res_id}")
        assert get_res.status_code == 200
        assert get_res.json()["status"] == "cancelled"
        print("✓ Verified reservation status is cancelled in database")


class TestCSVExport:
    """Test CSV export endpoint"""
    
    def test_csv_export_returns_csv_file(self):
        """GET /api/reservations/export/csv should return CSV with correct headers"""
        response = requests.get(f"{BASE_URL}/api/reservations/export/csv")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        # Check content type
        content_type = response.headers.get("content-type", "")
        assert "text/csv" in content_type, f"Expected text/csv, got {content_type}"
        
        # Check content disposition
        content_disp = response.headers.get("content-disposition", "")
        assert "attachment" in content_disp, f"Expected attachment, got {content_disp}"
        assert "reservations.csv" in content_disp, f"Expected reservations.csv in {content_disp}"
        
        # Check CSV content has headers
        content = response.text
        first_line = content.split('\n')[0]
        expected_headers = ["ID", "Asset", "Utilisateur", "Équipe", "Projet", "Site", "Début", "Fin", "Statut", "Priorité"]
        for header in expected_headers:
            assert header in first_line, f"Missing header: {header}"
        
        print(f"✓ CSV export returns valid CSV with headers: {first_line[:80]}...")
    
    def test_csv_export_with_status_filter(self):
        """GET /api/reservations/export/csv?status=confirmed should filter by status"""
        response = requests.get(f"{BASE_URL}/api/reservations/export/csv?status=confirmed")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        content = response.text
        lines = [l for l in content.split('\n') if l.strip()]
        
        # If there are data rows, check they have confirmed status
        if len(lines) > 1:
            # Status is at index 8 (0-indexed)
            for line in lines[1:]:
                if line.strip():
                    parts = line.split(',')
                    if len(parts) > 8:
                        status = parts[8]
                        assert status == "confirmed" or status == "", f"Expected confirmed status, got {status}"
        
        print(f"✓ CSV export with status filter works, {len(lines)-1} data rows")


class TestRolesEndpoints:
    """Test roles and permissions endpoints"""
    
    def test_get_roles_returns_roles_and_permissions(self):
        """GET /api/roles should return roles list and permissions"""
        response = requests.get(f"{BASE_URL}/api/roles")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "roles" in data, "Missing 'roles' key"
        assert "permissions" in data, "Missing 'permissions' key"
        
        # Check expected roles exist
        expected_roles = ["super_admin", "admin_client", "manager", "terrain"]
        for role in expected_roles:
            assert role in data["roles"], f"Missing role: {role}"
            assert role in data["permissions"], f"Missing permissions for role: {role}"
        
        # Check super_admin has wildcard permission
        assert "*" in data["permissions"]["super_admin"], "super_admin should have * permission"
        
        print(f"✓ GET /api/roles returns {len(data['roles'])} roles with permissions")
    
    def test_assign_role_to_user(self):
        """POST /api/roles/assign should assign a role to a user"""
        test_user_id = f"TEST-user-{uuid.uuid4().hex[:8]}"
        payload = {
            "user_id": test_user_id,
            "user_name": "TEST User Assign",
            "role": "manager"
        }
        response = requests.post(f"{BASE_URL}/api/roles/assign", json=payload)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["user_id"] == test_user_id
        assert data["user_name"] == "TEST User Assign"
        assert data["role"] == "manager"
        assert "permissions" in data
        assert "assigned_at" in data
        
        print(f"✓ POST /api/roles/assign works: assigned {data['role']} to {data['user_name']}")
    
    def test_assign_invalid_role_returns_400(self):
        """POST /api/roles/assign with invalid role should return 400"""
        payload = {
            "user_id": "test-user",
            "user_name": "Test",
            "role": "invalid_role_xyz"
        }
        response = requests.post(f"{BASE_URL}/api/roles/assign", json=payload)
        assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
        print("✓ POST /api/roles/assign with invalid role returns 400")
    
    def test_get_users_with_roles(self):
        """GET /api/roles/users should return list of users with roles"""
        response = requests.get(f"{BASE_URL}/api/roles/users")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        
        # If there are users, check structure
        if len(data) > 0:
            user = data[0]
            assert "user_id" in user or "id" in user
            assert "role" in user
        
        print(f"✓ GET /api/roles/users returns {len(data)} users with roles")
    
    def test_check_permission_endpoint(self):
        """GET /api/roles/check/{user_id}/{permission} should check permission"""
        # First assign a role
        test_user_id = f"TEST-perm-{uuid.uuid4().hex[:8]}"
        assign_payload = {
            "user_id": test_user_id,
            "user_name": "TEST Perm User",
            "role": "terrain"
        }
        requests.post(f"{BASE_URL}/api/roles/assign", json=assign_payload)
        
        # Check a permission terrain should have
        response = requests.get(f"{BASE_URL}/api/roles/check/{test_user_id}/reservations.read")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "allowed" in data
        print(f"✓ Permission check works: allowed={data.get('allowed')}, role={data.get('role')}")


class TestWebSocketEndpoint:
    """Test WebSocket endpoint availability"""
    
    def test_websocket_endpoint_exists(self):
        """WebSocket /ws endpoint should be accessible (HTTP upgrade expected)"""
        # We can't do full WebSocket test with requests, but we can check the endpoint exists
        # A GET to /ws should return 403 or similar (not 404)
        response = requests.get(f"{BASE_URL}/ws")
        # WebSocket endpoints typically return 403 or 400 for non-upgrade requests, not 404
        assert response.status_code != 404, f"WebSocket endpoint /ws not found (got {response.status_code})"
        print(f"✓ WebSocket endpoint /ws exists (status: {response.status_code})")


class TestExistingEndpointsStillWork:
    """Verify existing endpoints still work after changes"""
    
    def test_reservations_list(self):
        """GET /api/reservations should still work"""
        response = requests.get(f"{BASE_URL}/api/reservations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations works: {len(data)} reservations")
    
    def test_reservations_kpis(self):
        """GET /api/reservations/kpis should still work"""
        response = requests.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "active" in data
        print(f"✓ GET /api/reservations/kpis works: total={data['total']}")
    
    def test_notifications_list(self):
        """GET /api/notifications should still work"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/notifications works: {len(data)} notifications")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
