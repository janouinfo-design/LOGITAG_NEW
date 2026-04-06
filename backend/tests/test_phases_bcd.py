"""
Test Suite for LOGITAG Phases B, C, D
- Phase B: Gantt View for Reservations
- Phase C: Approval/Rejection Flow
- Phase D: Operational KPIs in Command Center
"""
import pytest
import requests
import os
import json
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPhaseB_GanttView:
    """Phase B: Gantt View for Reservations"""
    
    def test_gantt_endpoint_returns_200(self):
        """GET /api/reservations/gantt returns 200"""
        response = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Gantt endpoint returns 200")
    
    def test_gantt_response_structure(self):
        """Gantt response has correct structure: assets, range_start, range_end, total_reservations"""
        response = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert response.status_code == 200
        data = response.json()
        
        # Check required fields
        assert "assets" in data, "Missing 'assets' field"
        assert "range_start" in data, "Missing 'range_start' field"
        assert "range_end" in data, "Missing 'range_end' field"
        assert "total_reservations" in data, "Missing 'total_reservations' field"
        
        # Validate types
        assert isinstance(data["assets"], list), "'assets' should be a list"
        assert isinstance(data["total_reservations"], int), "'total_reservations' should be int"
        
        print(f"✓ Gantt structure valid: {len(data['assets'])} assets, {data['total_reservations']} reservations")
    
    def test_gantt_assets_grouped_correctly(self):
        """Each asset in gantt has asset_id, asset_name, and reservations list"""
        response = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert response.status_code == 200
        data = response.json()
        
        if len(data["assets"]) > 0:
            asset = data["assets"][0]
            assert "asset_id" in asset, "Asset missing 'asset_id'"
            assert "asset_name" in asset, "Asset missing 'asset_name'"
            assert "reservations" in asset, "Asset missing 'reservations'"
            assert isinstance(asset["reservations"], list), "'reservations' should be a list"
            
            # Check reservation structure
            if len(asset["reservations"]) > 0:
                res = asset["reservations"][0]
                required_fields = ["id", "user_name", "status", "start_date", "end_date"]
                for field in required_fields:
                    assert field in res, f"Reservation missing '{field}'"
            
            print(f"✓ Asset grouping correct: {asset['asset_name']} has {len(asset['reservations'])} reservations")
        else:
            print("⚠ No assets in gantt data (may need seed data)")
    
    def test_gantt_days_parameter(self):
        """Gantt respects days parameter (7, 14, 30)"""
        for days in [7, 14, 30]:
            response = requests.get(f"{BASE_URL}/api/reservations/gantt?days={days}")
            assert response.status_code == 200, f"Failed for days={days}"
            data = response.json()
            
            # Verify range is approximately correct
            range_start = datetime.fromisoformat(data["range_start"].replace("Z", "+00:00"))
            range_end = datetime.fromisoformat(data["range_end"].replace("Z", "+00:00"))
            actual_days = (range_end - range_start).days
            
            # Allow some tolerance (3 days before + days parameter)
            assert actual_days >= days, f"Range too short for days={days}: got {actual_days}"
            
        print("✓ Days parameter works correctly for 7, 14, 30")


class TestPhaseC_ApprovalFlow:
    """Phase C: Approval/Rejection Flow"""
    
    @pytest.fixture(autouse=True)
    def setup_requested_reservation(self):
        """Create a 'requested' reservation for testing"""
        # Create a new requested reservation
        payload = {
            "asset_id": "asset-test-approval",
            "asset_name": "TEST_ApprovalAsset",
            "user_name": "TEST_User",
            "team": "Test Team",
            "project": "Approval Test",
            "site": "Test Site",
            "start_date": (datetime.utcnow() + timedelta(days=5)).isoformat() + "+00:00",
            "end_date": (datetime.utcnow() + timedelta(days=5, hours=8)).isoformat() + "+00:00",
            "priority": "normal",
            "status": "requested"
        }
        response = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        if response.status_code == 201 or response.status_code == 200:
            self.test_reservation = response.json()
        else:
            # Try to find an existing requested reservation
            res = requests.get(f"{BASE_URL}/api/reservations?status=requested")
            if res.status_code == 200 and len(res.json()) > 0:
                self.test_reservation = res.json()[0]
            else:
                self.test_reservation = None
        yield
        # Cleanup: delete test reservation if created
        if self.test_reservation and self.test_reservation.get("asset_name", "").startswith("TEST_"):
            # Note: No delete endpoint, so we leave it
            pass
    
    def test_approve_changes_status_to_confirmed(self):
        """POST /api/reservations/{id}/approve changes status from 'requested' to 'confirmed'"""
        if not self.test_reservation:
            pytest.skip("No requested reservation available for testing")
        
        res_id = self.test_reservation["id"]
        
        # Approve the reservation
        response = requests.post(f"{BASE_URL}/api/reservations/{res_id}/approve")
        assert response.status_code == 200, f"Approve failed: {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "confirmed", f"Expected status 'confirmed', got {data.get('status')}"
        
        # Verify by fetching the reservation
        verify_res = requests.get(f"{BASE_URL}/api/reservations/{res_id}")
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["status"] == "confirmed", "Status not persisted as 'confirmed'"
        
        print(f"✓ Approve works: {res_id[:8]} -> confirmed")
    
    def test_reject_changes_status_to_rejected(self):
        """POST /api/reservations/{id}/reject changes status to 'rejected'"""
        # Create a new requested reservation for rejection test
        payload = {
            "asset_id": "asset-test-reject",
            "asset_name": "TEST_RejectAsset",
            "user_name": "TEST_RejectUser",
            "team": "Test Team",
            "project": "Reject Test",
            "site": "Test Site",
            "start_date": (datetime.utcnow() + timedelta(days=6)).isoformat() + "+00:00",
            "end_date": (datetime.utcnow() + timedelta(days=6, hours=8)).isoformat() + "+00:00",
            "priority": "normal",
            "status": "requested"
        }
        create_res = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        if create_res.status_code not in [200, 201]:
            pytest.skip("Could not create test reservation for rejection")
        
        res_id = create_res.json()["id"]
        
        # Reject the reservation
        response = requests.post(f"{BASE_URL}/api/reservations/{res_id}/reject")
        assert response.status_code == 200, f"Reject failed: {response.status_code}"
        
        data = response.json()
        assert data.get("status") == "rejected", f"Expected status 'rejected', got {data.get('status')}"
        
        # Verify by fetching the reservation
        verify_res = requests.get(f"{BASE_URL}/api/reservations/{res_id}")
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["status"] == "rejected", "Status not persisted as 'rejected'"
        
        print(f"✓ Reject works: {res_id[:8]} -> rejected")
    
    def test_approve_nonexistent_returns_404(self):
        """Approving non-existent reservation returns 404"""
        response = requests.post(f"{BASE_URL}/api/reservations/nonexistent-id-12345/approve")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Approve non-existent returns 404")
    
    def test_reject_nonexistent_returns_404(self):
        """Rejecting non-existent reservation returns 404"""
        response = requests.post(f"{BASE_URL}/api/reservations/nonexistent-id-12345/reject")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print("✓ Reject non-existent returns 404")


class TestPhaseD_OperationalKPIs:
    """Phase D: Operational KPIs in Command Center"""
    
    def test_today_summary_endpoint_returns_200(self):
        """GET /api/reservations/today-summary returns 200"""
        response = requests.get(f"{BASE_URL}/api/reservations/today-summary")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ Today-summary endpoint returns 200")
    
    def test_today_summary_response_structure(self):
        """Today-summary has required KPI fields"""
        response = requests.get(f"{BASE_URL}/api/reservations/today-summary")
        assert response.status_code == 200
        data = response.json()
        
        # Check required KPI fields
        required_fields = [
            "active_count", "upcoming_count", "overdue_count", 
            "pending_count", "alert_count", "timestamp"
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"
        
        # Validate types
        assert isinstance(data["active_count"], int), "active_count should be int"
        assert isinstance(data["upcoming_count"], int), "upcoming_count should be int"
        assert isinstance(data["overdue_count"], int), "overdue_count should be int"
        assert isinstance(data["pending_count"], int), "pending_count should be int"
        assert isinstance(data["alert_count"], int), "alert_count should be int"
        
        print(f"✓ Today-summary structure valid: active={data['active_count']}, upcoming={data['upcoming_count']}, overdue={data['overdue_count']}, pending={data['pending_count']}, alerts={data['alert_count']}")
    
    def test_today_summary_includes_detail_lists(self):
        """Today-summary includes active, upcoming, overdue, pending lists"""
        response = requests.get(f"{BASE_URL}/api/reservations/today-summary")
        assert response.status_code == 200
        data = response.json()
        
        # Check detail lists exist
        list_fields = ["active", "upcoming", "overdue", "pending"]
        for field in list_fields:
            assert field in data, f"Missing list field: {field}"
            assert isinstance(data[field], list), f"{field} should be a list"
        
        print(f"✓ Detail lists present: active({len(data['active'])}), upcoming({len(data['upcoming'])}), overdue({len(data['overdue'])}), pending({len(data['pending'])})")
    
    def test_kpis_endpoint_returns_200(self):
        """GET /api/reservations/kpis returns 200"""
        response = requests.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ KPIs endpoint returns 200")
    
    def test_kpis_response_structure(self):
        """KPIs endpoint has required fields"""
        response = requests.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200
        data = response.json()
        
        required_fields = ["total", "active", "confirmed", "today", "overdue", "completed"]
        for field in required_fields:
            assert field in data, f"Missing KPI field: {field}"
            assert isinstance(data[field], int), f"{field} should be int"
        
        print(f"✓ KPIs structure valid: total={data['total']}, active={data['active']}, confirmed={data['confirmed']}, overdue={data['overdue']}")


class TestIntegration:
    """Integration tests for Phases B, C, D"""
    
    def test_gantt_shows_requested_reservations(self):
        """Gantt view includes reservations with 'requested' status"""
        # First create a requested reservation
        payload = {
            "asset_id": "asset-gantt-test",
            "asset_name": "TEST_GanttAsset",
            "user_name": "TEST_GanttUser",
            "team": "Test Team",
            "project": "Gantt Test",
            "site": "Test Site",
            "start_date": (datetime.utcnow() + timedelta(days=2)).isoformat() + "+00:00",
            "end_date": (datetime.utcnow() + timedelta(days=2, hours=4)).isoformat() + "+00:00",
            "priority": "high",
            "status": "requested"
        }
        create_res = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        
        # Check gantt includes it
        gantt_res = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert gantt_res.status_code == 200
        data = gantt_res.json()
        
        # Find the test asset
        found = False
        for asset in data["assets"]:
            if asset["asset_name"] == "TEST_GanttAsset":
                for res in asset["reservations"]:
                    if res["status"] == "requested":
                        found = True
                        break
        
        if create_res.status_code in [200, 201]:
            assert found, "Requested reservation not found in Gantt view"
            print("✓ Gantt shows requested reservations")
        else:
            print("⚠ Could not create test reservation (may have conflict)")
    
    def test_approval_updates_gantt_status(self):
        """After approval, Gantt shows updated status"""
        # Create requested reservation
        payload = {
            "asset_id": "asset-approval-gantt",
            "asset_name": "TEST_ApprovalGantt",
            "user_name": "TEST_User",
            "team": "Test Team",
            "project": "Approval Gantt Test",
            "site": "Test Site",
            "start_date": (datetime.utcnow() + timedelta(days=3)).isoformat() + "+00:00",
            "end_date": (datetime.utcnow() + timedelta(days=3, hours=6)).isoformat() + "+00:00",
            "priority": "normal",
            "status": "requested"
        }
        create_res = requests.post(f"{BASE_URL}/api/reservations", json=payload)
        if create_res.status_code not in [200, 201]:
            pytest.skip("Could not create test reservation")
        
        res_id = create_res.json()["id"]
        
        # Approve it
        approve_res = requests.post(f"{BASE_URL}/api/reservations/{res_id}/approve")
        assert approve_res.status_code == 200
        
        # Check gantt shows confirmed status
        gantt_res = requests.get(f"{BASE_URL}/api/reservations/gantt?days=14")
        assert gantt_res.status_code == 200
        data = gantt_res.json()
        
        found_confirmed = False
        for asset in data["assets"]:
            if asset["asset_name"] == "TEST_ApprovalGantt":
                for res in asset["reservations"]:
                    if res["id"] == res_id and res["status"] == "confirmed":
                        found_confirmed = True
                        break
        
        assert found_confirmed, "Approved reservation not showing as 'confirmed' in Gantt"
        print(f"✓ Approval updates Gantt status: {res_id[:8]} -> confirmed")
    
    def test_pending_count_matches_requested_reservations(self):
        """pending_count in today-summary matches requested reservations count"""
        # Get today-summary
        summary_res = requests.get(f"{BASE_URL}/api/reservations/today-summary")
        assert summary_res.status_code == 200
        summary = summary_res.json()
        
        # Get requested reservations
        requested_res = requests.get(f"{BASE_URL}/api/reservations?status=requested")
        assert requested_res.status_code == 200
        requested = requested_res.json()
        
        # pending_count should match
        assert summary["pending_count"] == len(requested), f"pending_count ({summary['pending_count']}) != requested count ({len(requested)})"
        print(f"✓ pending_count matches: {summary['pending_count']} requested reservations")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
