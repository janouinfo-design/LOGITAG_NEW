"""
Test Zones Advanced Geofencing API - Iteration 24
Tests for advanced geofencing endpoints:
- POST /api/zones - Create zone with BLE shape, mode, rssi_threshold
- GET /api/zones/events - List zone events
- GET /api/zones/events/stats - Get event statistics
- POST /api/zones/events - Create zone event
- POST /api/zones/detect - Detect asset in zone (GPS circle detection)
- POST /api/zones/trigger - Trigger zone event with alert checking
- GET /api/zones/alerts - List zone alerts
- POST /api/zones/alerts - Create alert rule
- DELETE /api/zones/alerts/{id} - Delete alert
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestZonesAdvancedCRUD:
    """Test advanced zone features: BLE shape, mode, RSSI threshold"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_zone_ids = []
        self.test_alert_ids = []
        yield
        # Cleanup
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
        for alert_id in self.test_alert_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/alerts/{alert_id}")
            except:
                pass
    
    def test_01_create_ble_zone(self):
        """POST /api/zones - Create zone with shape=ble, mode=entry, rssi_threshold"""
        zone_data = {
            "name": f"TEST_BLE_Zone_{uuid.uuid4().hex[:8]}",
            "type": "depot",
            "shape": "ble",
            "mode": "entry",
            "color": "#EC4899",
            "router_id": "router-001",
            "router_name": "Router Test",
            "rssi_threshold": -65,
            "debounce_seconds": 20,
            "rssi_smoothing": 5,
            "alertEntry": True,
            "alertExit": False,
            "active": True
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created, "Response should contain 'id'"
        assert created["shape"] == "ble", "Shape should be 'ble'"
        assert created["mode"] == "entry", "Mode should be 'entry'"
        assert created["rssi_threshold"] == -65, "RSSI threshold should be -65"
        assert created["debounce_seconds"] == 20, "Debounce should be 20"
        assert created["rssi_smoothing"] == 5, "Smoothing should be 5"
        assert created["router_id"] == "router-001", "Router ID should match"
        
        self.test_zone_ids.append(created["id"])
        print(f"✓ Created BLE zone with mode=entry, rssi_threshold=-65: {created['id']}")
    
    def test_02_create_zone_with_exit_mode(self):
        """POST /api/zones - Create zone with mode=exit"""
        zone_data = {
            "name": f"TEST_Exit_Zone_{uuid.uuid4().hex[:8]}",
            "type": "restricted",
            "shape": "circle",
            "mode": "exit",
            "color": "#D97706",
            "center": [46.82, 7.15],
            "radius": 250
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        created = response.json()
        assert created["mode"] == "exit", "Mode should be 'exit'"
        self.test_zone_ids.append(created["id"])
        print(f"✓ Created zone with mode=exit: {created['id']}")
    
    def test_03_create_zone_with_both_mode(self):
        """POST /api/zones - Create zone with mode=both (default)"""
        zone_data = {
            "name": f"TEST_Both_Zone_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "polygon",
            "mode": "both",
            "color": "#059669",
            "polygon": [[46.81, 7.13], [46.82, 7.13], [46.82, 7.15], [46.81, 7.15]]
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200
        
        created = response.json()
        assert created["mode"] == "both", "Mode should be 'both'"
        self.test_zone_ids.append(created["id"])
        print(f"✓ Created zone with mode=both: {created['id']}")


class TestZoneEvents:
    """Test zone events endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_zone_ids = []
        yield
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
    
    def test_04_list_zone_events_returns_200(self):
        """GET /api/zones/events - Should return 200 and list (NOT 404)"""
        response = requests.get(f"{BASE_URL}/api/zones/events")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}. Route ordering bug may exist!"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/zones/events returned {len(data)} events (status 200)")
    
    def test_05_zone_events_stats_returns_correct_structure(self):
        """GET /api/zones/events/stats - Should return stats with entries/exits/ble_detected/recent_24h"""
        response = requests.get(f"{BASE_URL}/api/zones/events/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        stats = response.json()
        assert "total_events" in stats, "Should have total_events"
        assert "entries" in stats, "Should have entries count"
        assert "exits" in stats, "Should have exits count"
        assert "not_detected" in stats, "Should have not_detected count"
        assert "ble_detected" in stats, "Should have ble_detected count"
        assert "recent_24h" in stats, "Should have recent_24h count"
        assert "most_active_zones" in stats, "Should have most_active_zones"
        
        print(f"✓ GET /api/zones/events/stats returned: entries={stats['entries']}, exits={stats['exits']}, ble={stats['ble_detected']}, 24h={stats['recent_24h']}")
    
    def test_06_create_zone_event(self):
        """POST /api/zones/events - Create a zone event"""
        # First create a zone
        zone_data = {
            "name": f"TEST_Event_Zone_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "center": [46.82, 7.15],
            "radius": 200
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Create an event
        event_data = {
            "asset_id": "asset-test-001",
            "asset_name": "Test Asset",
            "zone_id": zone["id"],
            "zone_name": zone["name"],
            "event_type": "asset_enter_zone",
            "signal_strength": -55,
            "location": [46.82, 7.15]
        }
        response = requests.post(f"{BASE_URL}/api/zones/events", json=event_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        event = response.json()
        assert "id" in event, "Event should have id"
        assert event["asset_id"] == "asset-test-001", "Asset ID should match"
        assert event["event_type"] == "asset_enter_zone", "Event type should match"
        assert "timestamp" in event, "Event should have timestamp"
        print(f"✓ Created zone event: {event['id']}")
    
    def test_07_list_events_with_filters(self):
        """GET /api/zones/events - Test filtering by event_type"""
        response = requests.get(f"{BASE_URL}/api/zones/events?event_type=asset_enter_zone&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # All returned events should be of type asset_enter_zone
        for event in data:
            assert event.get("event_type") == "asset_enter_zone", "Filter should work"
        print(f"✓ GET /api/zones/events with filter returned {len(data)} events")


class TestZoneDetection:
    """Test zone detection endpoint (GPS circle detection)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_zone_ids = []
        yield
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
    
    def test_08_detect_asset_in_circle_zone(self):
        """POST /api/zones/detect - Detect asset in GPS circle zone"""
        # Create a circle zone
        zone_data = {
            "name": f"TEST_Detect_Circle_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "mode": "both",
            "center": [46.82, 7.15],
            "radius": 500,
            "active": True
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Detect asset inside the zone
        detect_data = {
            "asset_id": "asset-detect-001",
            "asset_name": "Detect Test Asset",
            "lat": 46.82,
            "lng": 7.15
        }
        response = requests.post(f"{BASE_URL}/api/zones/detect", json=detect_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert "asset_id" in result, "Should have asset_id"
        assert "zones_detected" in result, "Should have zones_detected"
        assert "total_zones_in" in result, "Should have total_zones_in"
        
        # Asset should be detected in our zone
        detected_zone_ids = [z["zone_id"] for z in result["zones_detected"]]
        assert zone["id"] in detected_zone_ids, "Asset should be detected in the created zone"
        print(f"✓ POST /api/zones/detect - Asset detected in {len(result['zones_detected'])} zone(s)")
    
    def test_09_detect_asset_outside_zone(self):
        """POST /api/zones/detect - Asset outside zone should not be detected"""
        # Create a circle zone
        zone_data = {
            "name": f"TEST_Detect_Outside_{uuid.uuid4().hex[:8]}",
            "type": "depot",
            "shape": "circle",
            "center": [46.82, 7.15],
            "radius": 100,
            "active": True
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Detect asset far outside the zone
        detect_data = {
            "asset_id": "asset-outside-001",
            "lat": 47.00,  # Far from zone center
            "lng": 8.00
        }
        response = requests.post(f"{BASE_URL}/api/zones/detect", json=detect_data)
        assert response.status_code == 200
        
        result = response.json()
        # Asset should NOT be in our specific zone
        detected_zone_ids = [z["zone_id"] for z in result["zones_detected"]]
        assert zone["id"] not in detected_zone_ids, "Asset should NOT be detected in zone (too far)"
        print(f"✓ POST /api/zones/detect - Asset correctly not detected when outside zone")


class TestZoneTrigger:
    """Test zone trigger endpoint with alert checking"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_zone_ids = []
        self.test_alert_ids = []
        yield
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
        for alert_id in self.test_alert_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/alerts/{alert_id}")
            except:
                pass
    
    def test_10_trigger_zone_event(self):
        """POST /api/zones/trigger - Trigger zone event"""
        # Create a zone
        zone_data = {
            "name": f"TEST_Trigger_Zone_{uuid.uuid4().hex[:8]}",
            "type": "restricted",
            "shape": "circle",
            "mode": "both",
            "center": [46.82, 7.15],
            "radius": 200
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Trigger an event
        trigger_data = {
            "asset_id": "asset-trigger-001",
            "asset_name": "Trigger Test Asset",
            "zone_id": zone["id"],
            "event_type": "asset_enter_zone",
            "location": [46.82, 7.15]
        }
        response = requests.post(f"{BASE_URL}/api/zones/trigger", json=trigger_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        result = response.json()
        assert result.get("status") == "triggered", "Status should be 'triggered'"
        assert "event" in result, "Should have event data"
        assert "alerts_triggered" in result, "Should have alerts_triggered count"
        print(f"✓ POST /api/zones/trigger - Event triggered, alerts_triggered={result['alerts_triggered']}")
    
    def test_11_trigger_respects_zone_mode_entry_only(self):
        """POST /api/zones/trigger - Zone with mode=entry should skip exit events"""
        # Create entry-only zone
        zone_data = {
            "name": f"TEST_Entry_Only_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "mode": "entry",
            "center": [46.82, 7.15],
            "radius": 200
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Try to trigger an exit event (should be skipped)
        trigger_data = {
            "asset_id": "asset-mode-test",
            "zone_id": zone["id"],
            "event_type": "asset_exit_zone"
        }
        response = requests.post(f"{BASE_URL}/api/zones/trigger", json=trigger_data)
        assert response.status_code == 200
        
        result = response.json()
        assert result.get("status") == "skipped", "Exit event should be skipped for entry-only zone"
        assert "reason" in result, "Should have reason for skipping"
        print(f"✓ POST /api/zones/trigger - Exit event correctly skipped for entry-only zone")
    
    def test_12_trigger_nonexistent_zone_returns_404(self):
        """POST /api/zones/trigger - Non-existent zone should return 404"""
        trigger_data = {
            "asset_id": "asset-404-test",
            "zone_id": "nonexistent-zone-id",
            "event_type": "asset_enter_zone"
        }
        response = requests.post(f"{BASE_URL}/api/zones/trigger", json=trigger_data)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ POST /api/zones/trigger - Returns 404 for non-existent zone")


class TestZoneAlerts:
    """Test zone alerts CRUD endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_zone_ids = []
        self.test_alert_ids = []
        yield
        for alert_id in self.test_alert_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/alerts/{alert_id}")
            except:
                pass
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
    
    def test_13_list_zone_alerts_returns_200(self):
        """GET /api/zones/alerts - Should return 200 and list"""
        response = requests.get(f"{BASE_URL}/api/zones/alerts")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/zones/alerts returned {len(data)} alerts")
    
    def test_14_create_zone_alert(self):
        """POST /api/zones/alerts - Create alert rule"""
        # First create a zone
        zone_data = {
            "name": f"TEST_Alert_Zone_{uuid.uuid4().hex[:8]}",
            "type": "restricted",
            "shape": "circle",
            "center": [46.82, 7.15],
            "radius": 200
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert zone_response.status_code == 200
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        # Create an alert
        alert_data = {
            "zone_id": zone["id"],
            "zone_name": zone["name"],
            "alert_type": "asset_enter",
            "message_template": "Asset entered restricted zone!",
            "enabled": True,
            "channels": ["in_app", "email"],
            "cooldown_minutes": 10
        }
        response = requests.post(f"{BASE_URL}/api/zones/alerts", json=alert_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        alert = response.json()
        assert "id" in alert, "Alert should have id"
        assert alert["zone_id"] == zone["id"], "Zone ID should match"
        assert alert["alert_type"] == "asset_enter", "Alert type should match"
        assert alert["enabled"] == True, "Enabled should be True"
        assert alert["cooldown_minutes"] == 10, "Cooldown should be 10"
        assert "in_app" in alert["channels"], "Channels should include in_app"
        
        self.test_alert_ids.append(alert["id"])
        print(f"✓ Created zone alert: {alert['id']}")
    
    def test_15_delete_zone_alert(self):
        """DELETE /api/zones/alerts/{id} - Delete alert"""
        # Create a zone and alert
        zone_data = {
            "name": f"TEST_Delete_Alert_Zone_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "center": [46.82, 7.15],
            "radius": 200
        }
        zone_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        zone = zone_response.json()
        self.test_zone_ids.append(zone["id"])
        
        alert_data = {
            "zone_id": zone["id"],
            "alert_type": "asset_exit",
            "enabled": True,
            "channels": ["in_app"],
            "cooldown_minutes": 5
        }
        alert_response = requests.post(f"{BASE_URL}/api/zones/alerts", json=alert_data)
        assert alert_response.status_code == 200
        alert = alert_response.json()
        alert_id = alert["id"]
        
        # Delete the alert
        delete_response = requests.delete(f"{BASE_URL}/api/zones/alerts/{alert_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        result = delete_response.json()
        assert result.get("status") == "deleted", "Should return status: deleted"
        print(f"✓ DELETE /api/zones/alerts/{alert_id} - Alert deleted")
        
        # Verify alert is gone
        list_response = requests.get(f"{BASE_URL}/api/zones/alerts")
        alerts = list_response.json()
        alert_ids = [a["id"] for a in alerts]
        assert alert_id not in alert_ids, "Deleted alert should not appear in list"
        print(f"✓ Verified alert removed from database")
    
    def test_16_delete_nonexistent_alert_returns_404(self):
        """DELETE /api/zones/alerts/{id} - Non-existent alert should return 404"""
        response = requests.delete(f"{BASE_URL}/api/zones/alerts/nonexistent-alert-id")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ DELETE non-existent alert returns 404")


class TestRouteOrdering:
    """Test that static routes work correctly (route ordering bug fix verification)"""
    
    def test_17_events_route_not_404(self):
        """Verify /api/zones/events does NOT return 404 (route ordering fix)"""
        response = requests.get(f"{BASE_URL}/api/zones/events")
        assert response.status_code != 404, "Route ordering bug: /zones/events should NOT return 404"
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ /api/zones/events returns 200 (route ordering correct)")
    
    def test_18_events_stats_route_not_404(self):
        """Verify /api/zones/events/stats does NOT return 404"""
        response = requests.get(f"{BASE_URL}/api/zones/events/stats")
        assert response.status_code != 404, "Route ordering bug: /zones/events/stats should NOT return 404"
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ /api/zones/events/stats returns 200 (route ordering correct)")
    
    def test_19_detect_route_not_404(self):
        """Verify /api/zones/detect does NOT return 404"""
        detect_data = {"asset_id": "test", "lat": 46.82, "lng": 7.15}
        response = requests.post(f"{BASE_URL}/api/zones/detect", json=detect_data)
        assert response.status_code != 404, "Route ordering bug: /zones/detect should NOT return 404"
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ /api/zones/detect returns 200 (route ordering correct)")
    
    def test_20_alerts_route_not_404(self):
        """Verify /api/zones/alerts does NOT return 404"""
        response = requests.get(f"{BASE_URL}/api/zones/alerts")
        assert response.status_code != 404, "Route ordering bug: /zones/alerts should NOT return 404"
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print(f"✓ /api/zones/alerts returns 200 (route ordering correct)")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
