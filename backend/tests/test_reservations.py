"""
Backend API Tests for LOGITAG Reservation Module
Tests: CRUD operations, check-out/check-in, anti-conflict, notifications, KPIs
"""
import pytest
import requests
import os
import uuid
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://logitag-dashboard-v2.preview.emergentagent.com')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestReservationsBasic:
    """Basic reservation CRUD tests"""
    
    def test_get_reservations_list(self, api_client):
        """GET /api/reservations returns list of reservations"""
        response = api_client.get(f"{BASE_URL}/api/reservations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations: {len(data)} reservations found")
    
    def test_get_reservations_with_status_filter(self, api_client):
        """GET /api/reservations?status=confirmed filters by status"""
        response = api_client.get(f"{BASE_URL}/api/reservations?status=confirmed")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        for r in data:
            assert r['status'] == 'confirmed'
        print(f"✓ GET /api/reservations?status=confirmed: {len(data)} confirmed reservations")
    
    def test_get_reservations_planning(self, api_client):
        """GET /api/reservations/planning returns planning data"""
        response = api_client.get(f"{BASE_URL}/api/reservations/planning")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/reservations/planning: {len(data)} planning items")
    
    def test_get_reservations_kpis(self, api_client):
        """GET /api/reservations/kpis returns KPI data"""
        response = api_client.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200
        data = response.json()
        # Verify KPI structure
        assert 'total' in data
        assert 'active' in data
        assert 'confirmed' in data
        assert 'today' in data
        assert 'overdue' in data
        assert 'completed' in data
        assert 'cancelled' in data
        assert 'unread_notifications' in data
        assert 'top_assets' in data
        assert isinstance(data['top_assets'], list)
        print(f"✓ GET /api/reservations/kpis: total={data['total']}, active={data['active']}, overdue={data['overdue']}")


class TestReservationCreate:
    """Reservation creation tests"""
    
    def test_create_reservation_success(self, api_client):
        """POST /api/reservations creates a new reservation"""
        # Use future dates to avoid conflicts
        start = (datetime.utcnow() + timedelta(days=30)).isoformat()
        end = (datetime.utcnow() + timedelta(days=30, hours=4)).isoformat()
        
        payload = {
            "asset_id": f"TEST-asset-{uuid.uuid4().hex[:8]}",
            "asset_name": "TEST Asset for Creation",
            "user_name": "TEST User",
            "team": "TEST Team",
            "project": "TEST Project",
            "site": "TEST Site",
            "start_date": start,
            "end_date": end,
            "note": "Test reservation created by pytest",
            "priority": "normal"
        }
        
        response = api_client.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert 'id' in data
        assert data['asset_name'] == payload['asset_name']
        assert data['user_name'] == payload['user_name']
        assert data['status'] == 'confirmed'
        
        print(f"✓ POST /api/reservations: Created reservation {data['id'][:8]}...")
        
        # Cleanup - cancel the test reservation
        cancel_response = api_client.post(f"{BASE_URL}/api/reservations/{data['id']}/cancel")
        assert cancel_response.status_code == 200
        print(f"  → Cleaned up test reservation")
    
    def test_create_reservation_missing_fields(self, api_client):
        """POST /api/reservations with missing fields returns 422"""
        payload = {
            "asset_id": "test-asset",
            # Missing required fields
        }
        
        response = api_client.post(f"{BASE_URL}/api/reservations", json=payload)
        assert response.status_code == 422  # Validation error
        print(f"✓ POST /api/reservations with missing fields: 422 validation error")


class TestAntiConflict:
    """Anti-conflict mechanism tests"""
    
    def test_conflict_detection_returns_409(self, api_client):
        """POST /api/reservations returns 409 for conflicting dates"""
        # First, create a reservation
        asset_id = f"CONFLICT-TEST-{uuid.uuid4().hex[:8]}"
        start = (datetime.utcnow() + timedelta(days=50)).isoformat()
        end = (datetime.utcnow() + timedelta(days=50, hours=8)).isoformat()
        
        payload1 = {
            "asset_id": asset_id,
            "asset_name": "Conflict Test Asset",
            "user_name": "User 1",
            "start_date": start,
            "end_date": end,
            "priority": "normal"
        }
        
        response1 = api_client.post(f"{BASE_URL}/api/reservations", json=payload1)
        assert response1.status_code == 200
        res1_id = response1.json()['id']
        print(f"✓ Created first reservation: {res1_id[:8]}...")
        
        # Try to create overlapping reservation for same asset
        overlap_start = (datetime.utcnow() + timedelta(days=50, hours=2)).isoformat()
        overlap_end = (datetime.utcnow() + timedelta(days=50, hours=6)).isoformat()
        
        payload2 = {
            "asset_id": asset_id,  # Same asset
            "asset_name": "Conflict Test Asset",
            "user_name": "User 2",
            "start_date": overlap_start,
            "end_date": overlap_end,
            "priority": "normal"
        }
        
        response2 = api_client.post(f"{BASE_URL}/api/reservations", json=payload2)
        assert response2.status_code == 409  # Conflict!
        error_data = response2.json()
        assert 'detail' in error_data
        assert 'Conflit' in error_data['detail']
        print(f"✓ POST /api/reservations with conflict: 409 - {error_data['detail'][:50]}...")
        
        # Cleanup
        api_client.post(f"{BASE_URL}/api/reservations/{res1_id}/cancel")
        print(f"  → Cleaned up test reservation")


class TestCheckOutCheckIn:
    """Check-out and check-in workflow tests"""
    
    def test_checkout_confirmed_reservation(self, api_client):
        """POST /api/reservations/{id}/checkout changes status to in_progress"""
        # Create a confirmed reservation
        asset_id = f"CHECKOUT-TEST-{uuid.uuid4().hex[:8]}"
        start = (datetime.utcnow() + timedelta(days=60)).isoformat()
        end = (datetime.utcnow() + timedelta(days=60, hours=4)).isoformat()
        
        create_payload = {
            "asset_id": asset_id,
            "asset_name": "Checkout Test Asset",
            "user_name": "Checkout User",
            "start_date": start,
            "end_date": end,
            "priority": "normal"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/reservations", json=create_payload)
        assert create_response.status_code == 200
        res_id = create_response.json()['id']
        assert create_response.json()['status'] == 'confirmed'
        print(f"✓ Created confirmed reservation: {res_id[:8]}...")
        
        # Perform checkout
        checkout_payload = {
            "user_name": "Checkout User",
            "location": "Test Location",
            "condition": "good",
            "comment": "Test checkout"
        }
        
        checkout_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkout", json=checkout_payload)
        assert checkout_response.status_code == 200
        checkout_data = checkout_response.json()
        
        assert checkout_data['status'] == 'in_progress'
        assert checkout_data['checkout_by'] == 'Checkout User'
        assert checkout_data['checkout_location'] == 'Test Location'
        assert checkout_data['checkout_condition'] == 'good'
        assert checkout_data['checkout_at'] is not None
        print(f"✓ POST /api/reservations/{res_id[:8]}/checkout: status=in_progress")
        
        # Cleanup - do checkin to complete
        checkin_payload = {"user_name": "Checkout User", "condition": "good"}
        api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkin", json=checkin_payload)
        print(f"  → Completed test reservation via checkin")
    
    def test_checkin_in_progress_reservation(self, api_client):
        """POST /api/reservations/{id}/checkin changes status to completed"""
        # Create and checkout a reservation
        asset_id = f"CHECKIN-TEST-{uuid.uuid4().hex[:8]}"
        start = (datetime.utcnow() + timedelta(days=70)).isoformat()
        end = (datetime.utcnow() + timedelta(days=70, hours=4)).isoformat()
        
        create_payload = {
            "asset_id": asset_id,
            "asset_name": "Checkin Test Asset",
            "user_name": "Checkin User",
            "start_date": start,
            "end_date": end,
            "priority": "normal"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/reservations", json=create_payload)
        res_id = create_response.json()['id']
        
        # Checkout first
        checkout_payload = {"user_name": "Checkin User", "condition": "good"}
        api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkout", json=checkout_payload)
        print(f"✓ Created and checked out reservation: {res_id[:8]}...")
        
        # Now checkin
        checkin_payload = {
            "user_name": "Checkin User",
            "condition": "fair",
            "comment": "Test checkin - returned in fair condition"
        }
        
        checkin_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkin", json=checkin_payload)
        assert checkin_response.status_code == 200
        checkin_data = checkin_response.json()
        
        assert checkin_data['status'] == 'completed'
        assert checkin_data['checkin_by'] == 'Checkin User'
        assert checkin_data['checkin_condition'] == 'fair'
        assert checkin_data['checkin_at'] is not None
        print(f"✓ POST /api/reservations/{res_id[:8]}/checkin: status=completed")
    
    def test_checkout_non_confirmed_fails(self, api_client):
        """POST /api/reservations/{id}/checkout on non-confirmed returns 400"""
        # Get a completed or cancelled reservation
        response = api_client.get(f"{BASE_URL}/api/reservations?status=completed")
        data = response.json()
        
        if len(data) > 0:
            res_id = data[0]['id']
            checkout_payload = {"user_name": "Test", "condition": "good"}
            checkout_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkout", json=checkout_payload)
            assert checkout_response.status_code == 400
            print(f"✓ POST /api/reservations/{res_id[:8]}/checkout on completed: 400 error")
        else:
            pytest.skip("No completed reservations to test")
    
    def test_checkin_non_in_progress_fails(self, api_client):
        """POST /api/reservations/{id}/checkin on non-in_progress returns 400"""
        # Get a confirmed reservation
        response = api_client.get(f"{BASE_URL}/api/reservations?status=confirmed")
        data = response.json()
        
        if len(data) > 0:
            res_id = data[0]['id']
            checkin_payload = {"user_name": "Test", "condition": "good"}
            checkin_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/checkin", json=checkin_payload)
            assert checkin_response.status_code == 400
            print(f"✓ POST /api/reservations/{res_id[:8]}/checkin on confirmed: 400 error")
        else:
            pytest.skip("No confirmed reservations to test")


class TestCancelReservation:
    """Reservation cancellation tests"""
    
    def test_cancel_reservation(self, api_client):
        """POST /api/reservations/{id}/cancel changes status to cancelled"""
        # Create a reservation to cancel
        asset_id = f"CANCEL-TEST-{uuid.uuid4().hex[:8]}"
        start = (datetime.utcnow() + timedelta(days=80)).isoformat()
        end = (datetime.utcnow() + timedelta(days=80, hours=4)).isoformat()
        
        create_payload = {
            "asset_id": asset_id,
            "asset_name": "Cancel Test Asset",
            "user_name": "Cancel User",
            "start_date": start,
            "end_date": end,
            "priority": "normal"
        }
        
        create_response = api_client.post(f"{BASE_URL}/api/reservations", json=create_payload)
        res_id = create_response.json()['id']
        print(f"✓ Created reservation to cancel: {res_id[:8]}...")
        
        # Cancel it
        cancel_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/cancel")
        assert cancel_response.status_code == 200
        cancel_data = cancel_response.json()
        assert cancel_data['status'] == 'cancelled'
        print(f"✓ POST /api/reservations/{res_id[:8]}/cancel: status=cancelled")
        
        # Verify via GET
        get_response = api_client.get(f"{BASE_URL}/api/reservations/{res_id}")
        assert get_response.status_code == 200
        assert get_response.json()['status'] == 'cancelled'
        print(f"  → Verified cancellation via GET")
    
    def test_cancel_completed_fails(self, api_client):
        """POST /api/reservations/{id}/cancel on completed returns 400"""
        response = api_client.get(f"{BASE_URL}/api/reservations?status=completed")
        data = response.json()
        
        if len(data) > 0:
            res_id = data[0]['id']
            cancel_response = api_client.post(f"{BASE_URL}/api/reservations/{res_id}/cancel")
            assert cancel_response.status_code == 400
            print(f"✓ POST /api/reservations/{res_id[:8]}/cancel on completed: 400 error")
        else:
            pytest.skip("No completed reservations to test")


class TestNotifications:
    """Notification endpoint tests"""
    
    def test_get_notifications(self, api_client):
        """GET /api/notifications returns list of notifications"""
        response = api_client.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            notif = data[0]
            assert 'id' in notif
            assert 'type' in notif
            assert 'title' in notif
            assert 'message' in notif
            assert 'severity' in notif
            assert 'read' in notif
        
        print(f"✓ GET /api/notifications: {len(data)} notifications")
    
    def test_get_unread_notifications(self, api_client):
        """GET /api/notifications?unread_only=true returns only unread"""
        response = api_client.get(f"{BASE_URL}/api/notifications?unread_only=true")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        for notif in data:
            assert notif['read'] == False
        
        print(f"✓ GET /api/notifications?unread_only=true: {len(data)} unread notifications")
    
    def test_notification_count(self, api_client):
        """GET /api/notifications/count returns unread count"""
        response = api_client.get(f"{BASE_URL}/api/notifications/count")
        assert response.status_code == 200
        data = response.json()
        assert 'count' in data
        assert isinstance(data['count'], int)
        print(f"✓ GET /api/notifications/count: {data['count']} unread")
    
    def test_mark_all_notifications_read(self, api_client):
        """PUT /api/notifications/read-all marks all as read"""
        response = api_client.put(f"{BASE_URL}/api/notifications/read-all")
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        print(f"✓ PUT /api/notifications/read-all: success")
        
        # Verify all are read
        verify_response = api_client.get(f"{BASE_URL}/api/notifications?unread_only=true")
        verify_data = verify_response.json()
        assert len(verify_data) == 0
        print(f"  → Verified: 0 unread notifications")


class TestReservationDetail:
    """Single reservation detail tests"""
    
    def test_get_reservation_by_id(self, api_client):
        """GET /api/reservations/{id} returns reservation details with logs"""
        # Get any reservation
        list_response = api_client.get(f"{BASE_URL}/api/reservations")
        reservations = list_response.json()
        
        if len(reservations) > 0:
            res_id = reservations[0]['id']
            response = api_client.get(f"{BASE_URL}/api/reservations/{res_id}")
            assert response.status_code == 200
            data = response.json()
            
            assert data['id'] == res_id
            assert 'logs' in data  # Should include activity logs
            assert isinstance(data['logs'], list)
            print(f"✓ GET /api/reservations/{res_id[:8]}: found with {len(data['logs'])} logs")
        else:
            pytest.skip("No reservations to test")
    
    def test_get_nonexistent_reservation(self, api_client):
        """GET /api/reservations/{id} with invalid ID returns 404"""
        fake_id = str(uuid.uuid4())
        response = api_client.get(f"{BASE_URL}/api/reservations/{fake_id}")
        assert response.status_code == 404
        print(f"✓ GET /api/reservations/{fake_id[:8]}: 404 not found")


class TestAvailability:
    """Asset availability check tests"""
    
    def test_check_availability(self, api_client):
        """GET /api/reservations/availability/{asset_id} returns availability"""
        start = (datetime.utcnow() + timedelta(days=100)).isoformat()
        end = (datetime.utcnow() + timedelta(days=100, hours=4)).isoformat()
        
        response = api_client.get(f"{BASE_URL}/api/reservations/availability/test-asset?start={start}&end={end}")
        assert response.status_code == 200
        data = response.json()
        
        assert 'available' in data
        assert isinstance(data['available'], bool)
        assert 'conflict' in data
        assert 'maintenance' in data
        print(f"✓ GET /api/reservations/availability: available={data['available']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
