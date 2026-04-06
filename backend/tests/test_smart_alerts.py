"""
Test Smart Reservation Alerts System
- Alert rules CRUD
- Alert scan engine
- Alert resolution
- Alert stats
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSmartAlertRules:
    """Test alert rules endpoints"""
    
    def test_get_alert_rules(self):
        """GET /api/reservations/alerts/rules - should return 5 default rules"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts/rules")
        assert response.status_code == 200
        rules = response.json()
        assert isinstance(rules, list)
        assert len(rules) == 5
        
        # Verify rule structure
        rule_types = [r['type'] for r in rules]
        assert 'overdue' in rule_types
        assert 'upcoming' in rule_types
        assert 'no_checkout' in rule_types
        assert 'long_usage' in rule_types
        assert 'low_battery_reserved' in rule_types
        
        # Verify rule fields
        for rule in rules:
            assert 'id' in rule
            assert 'type' in rule
            assert 'label' in rule
            assert 'description' in rule
            assert 'enabled' in rule
            assert 'threshold_minutes' in rule
            assert 'severity' in rule
            assert 'auto_notify' in rule
        print(f"✓ Got {len(rules)} alert rules with correct structure")
    
    def test_toggle_rule_off(self):
        """PUT /api/reservations/alerts/rules/{id} - toggle rule off"""
        # Get rules first
        rules_resp = requests.get(f"{BASE_URL}/api/reservations/alerts/rules")
        rules = rules_resp.json()
        rule_id = rules[0]['id']
        
        # Toggle off
        response = requests.put(
            f"{BASE_URL}/api/reservations/alerts/rules/{rule_id}",
            json={"enabled": False}
        )
        assert response.status_code == 200
        assert response.json()['status'] == 'updated'
        
        # Verify change
        rules_resp = requests.get(f"{BASE_URL}/api/reservations/alerts/rules")
        updated_rule = next(r for r in rules_resp.json() if r['id'] == rule_id)
        assert updated_rule['enabled'] == False
        print(f"✓ Rule {rule_id[:8]} toggled off successfully")
        
        # Toggle back on
        requests.put(
            f"{BASE_URL}/api/reservations/alerts/rules/{rule_id}",
            json={"enabled": True}
        )
    
    def test_toggle_rule_on(self):
        """PUT /api/reservations/alerts/rules/{id} - toggle rule on"""
        rules_resp = requests.get(f"{BASE_URL}/api/reservations/alerts/rules")
        rules = rules_resp.json()
        rule_id = rules[0]['id']
        
        # Toggle on
        response = requests.put(
            f"{BASE_URL}/api/reservations/alerts/rules/{rule_id}",
            json={"enabled": True}
        )
        assert response.status_code == 200
        assert response.json()['status'] == 'updated'
        print(f"✓ Rule {rule_id[:8]} toggled on successfully")


class TestAlertScan:
    """Test alert scan engine"""
    
    def test_scan_reservations(self):
        """POST /api/reservations/alerts/scan - scan for alerts"""
        response = requests.post(f"{BASE_URL}/api/reservations/alerts/scan")
        assert response.status_code == 200
        data = response.json()
        
        assert 'scanned' in data
        assert 'alerts_generated' in data
        assert 'alerts' in data
        assert isinstance(data['scanned'], int)
        assert isinstance(data['alerts_generated'], int)
        assert isinstance(data['alerts'], list)
        print(f"✓ Scan completed: {data['scanned']} reservations scanned, {data['alerts_generated']} new alerts")


class TestAlertsList:
    """Test alerts list and resolution"""
    
    def test_get_active_alerts(self):
        """GET /api/reservations/alerts?status=active - get active alerts"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts?status=active")
        assert response.status_code == 200
        alerts = response.json()
        assert isinstance(alerts, list)
        
        # Verify alert structure if any exist
        if alerts:
            alert = alerts[0]
            assert 'id' in alert
            assert 'type' in alert
            assert 'title' in alert
            assert 'message' in alert
            assert 'severity' in alert
            assert 'resolved' in alert
            assert alert['resolved'] == False
            print(f"✓ Got {len(alerts)} active alerts with correct structure")
        else:
            print("✓ No active alerts (expected if all resolved)")
    
    def test_get_all_alerts(self):
        """GET /api/reservations/alerts - get all alerts"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts")
        assert response.status_code == 200
        alerts = response.json()
        assert isinstance(alerts, list)
        print(f"✓ Got {len(alerts)} total alerts")


class TestAlertStats:
    """Test alert statistics"""
    
    def test_get_alert_stats(self):
        """GET /api/reservations/alerts/stats - get alert statistics"""
        response = requests.get(f"{BASE_URL}/api/reservations/alerts/stats")
        assert response.status_code == 200
        stats = response.json()
        
        assert 'total_active' in stats
        assert 'by_type' in stats
        assert 'by_severity' in stats
        assert isinstance(stats['total_active'], int)
        assert isinstance(stats['by_type'], dict)
        assert isinstance(stats['by_severity'], dict)
        print(f"✓ Stats: {stats['total_active']} active alerts, by_type: {stats['by_type']}, by_severity: {stats['by_severity']}")


class TestReservationKPIs:
    """Test reservation KPIs for dashboard"""
    
    def test_get_kpis(self):
        """GET /api/reservations/kpis - get dashboard KPIs"""
        response = requests.get(f"{BASE_URL}/api/reservations/kpis")
        assert response.status_code == 200
        kpis = response.json()
        
        # Verify KPI fields
        assert 'total' in kpis
        assert 'active' in kpis
        assert 'confirmed' in kpis
        assert 'today' in kpis
        assert 'overdue' in kpis
        assert 'completed' in kpis
        assert 'unread_notifications' in kpis
        assert 'top_assets' in kpis
        
        print(f"✓ KPIs: total={kpis['total']}, active={kpis['active']}, confirmed={kpis['confirmed']}, overdue={kpis['overdue']}")


class TestNotifications:
    """Test notifications for alerts"""
    
    def test_get_notifications(self):
        """GET /api/notifications - get notifications"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 200
        notifs = response.json()
        assert isinstance(notifs, list)
        
        if notifs:
            notif = notifs[0]
            assert 'id' in notif
            assert 'type' in notif
            assert 'title' in notif
            assert 'message' in notif
            assert 'severity' in notif
            assert 'read' in notif
        print(f"✓ Got {len(notifs)} notifications")
    
    def test_notification_count(self):
        """GET /api/notifications/count - get unread count"""
        response = requests.get(f"{BASE_URL}/api/notifications/count")
        assert response.status_code == 200
        data = response.json()
        assert 'count' in data
        assert isinstance(data['count'], int)
        print(f"✓ Unread notifications: {data['count']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
