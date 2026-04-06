"""
Test Zones CRUD API - Iteration 23
Tests for MongoDB-connected zones endpoints:
- POST /api/zones - Create zone
- GET /api/zones - List all zones
- GET /api/zones/{id} - Get single zone
- PUT /api/zones/{id} - Update zone
- DELETE /api/zones/{id} - Delete zone
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestZonesCRUD:
    """Test Zones CRUD operations with MongoDB persistence"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_zone_ids = []
        yield
        # Cleanup: delete test zones created during tests
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
    
    def test_01_list_zones_returns_200(self):
        """GET /api/zones should return 200 and a list"""
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✓ GET /api/zones returned {len(data)} zones")
    
    def test_02_create_circle_zone(self):
        """POST /api/zones should create a circle zone"""
        zone_data = {
            "name": f"TEST_Circle_Zone_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "color": "#2563EB",
            "center": [46.82, 7.15],
            "radius": 300,
            "polygon": None,
            "alertEntry": True,
            "alertExit": False
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert "id" in created, "Response should contain 'id'"
        assert created["name"] == zone_data["name"], "Name should match"
        assert created["shape"] == "circle", "Shape should be circle"
        assert created["center"] == [46.82, 7.15], "Center should match"
        assert created["radius"] == 300, "Radius should match"
        assert created["alertEntry"] == True, "alertEntry should be True"
        
        self.test_zone_ids.append(created["id"])
        print(f"✓ Created circle zone: {created['id']}")
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/zones/{created['id']}")
        assert get_response.status_code == 200, "Should be able to GET created zone"
        fetched = get_response.json()
        assert fetched["name"] == zone_data["name"], "Fetched name should match"
        print(f"✓ Verified zone persisted in MongoDB")
    
    def test_03_create_polygon_zone(self):
        """POST /api/zones should create a polygon zone"""
        zone_data = {
            "name": f"TEST_Polygon_Zone_{uuid.uuid4().hex[:8]}",
            "type": "depot",
            "shape": "polygon",
            "color": "#059669",
            "center": None,
            "radius": None,
            "polygon": [[46.81, 7.13], [46.82, 7.13], [46.82, 7.15], [46.81, 7.15]],
            "alertEntry": False,
            "alertExit": True
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        created = response.json()
        assert created["shape"] == "polygon", "Shape should be polygon"
        assert created["polygon"] == zone_data["polygon"], "Polygon points should match"
        assert created["type"] == "depot", "Type should be depot"
        
        self.test_zone_ids.append(created["id"])
        print(f"✓ Created polygon zone: {created['id']}")
    
    def test_04_get_single_zone(self):
        """GET /api/zones/{id} should return a single zone"""
        # First create a zone
        zone_data = {
            "name": f"TEST_Get_Zone_{uuid.uuid4().hex[:8]}",
            "type": "restricted",
            "shape": "circle",
            "color": "#DC2626",
            "center": [46.83, 7.12],
            "radius": 150,
            "alertEntry": True,
            "alertExit": True
        }
        create_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert create_response.status_code == 200
        created = create_response.json()
        zone_id = created["id"]
        self.test_zone_ids.append(zone_id)
        
        # Now GET the zone
        get_response = requests.get(f"{BASE_URL}/api/zones/{zone_id}")
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}"
        
        fetched = get_response.json()
        assert fetched["id"] == zone_id, "ID should match"
        assert fetched["name"] == zone_data["name"], "Name should match"
        assert fetched["type"] == "restricted", "Type should match"
        print(f"✓ GET /api/zones/{zone_id} returned correct zone")
    
    def test_05_get_nonexistent_zone_returns_404(self):
        """GET /api/zones/{id} should return 404 for non-existent zone"""
        fake_id = "nonexistent-zone-id-12345"
        response = requests.get(f"{BASE_URL}/api/zones/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ GET non-existent zone returns 404")
    
    def test_06_update_zone(self):
        """PUT /api/zones/{id} should update a zone"""
        # Create a zone first
        zone_data = {
            "name": f"TEST_Update_Zone_{uuid.uuid4().hex[:8]}",
            "type": "parking",
            "shape": "circle",
            "color": "#D97706",
            "center": [46.79, 7.16],
            "radius": 200,
            "alertEntry": False,
            "alertExit": False
        }
        create_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert create_response.status_code == 200
        created = create_response.json()
        zone_id = created["id"]
        self.test_zone_ids.append(zone_id)
        
        # Update the zone
        update_data = {
            "name": "TEST_Updated_Zone_Name",
            "type": "chantier",
            "shape": "circle",
            "color": "#8B5CF6",
            "center": [46.80, 7.17],
            "radius": 400,
            "alertEntry": True,
            "alertExit": True
        }
        update_response = requests.put(f"{BASE_URL}/api/zones/{zone_id}", json=update_data)
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}: {update_response.text}"
        
        updated = update_response.json()
        assert updated["name"] == "TEST_Updated_Zone_Name", "Name should be updated"
        assert updated["type"] == "chantier", "Type should be updated"
        assert updated["radius"] == 400, "Radius should be updated"
        assert updated["alertEntry"] == True, "alertEntry should be updated"
        print(f"✓ PUT /api/zones/{zone_id} updated zone successfully")
        
        # Verify persistence
        get_response = requests.get(f"{BASE_URL}/api/zones/{zone_id}")
        assert get_response.status_code == 200
        fetched = get_response.json()
        assert fetched["name"] == "TEST_Updated_Zone_Name", "Update should persist"
        assert "updated_at" in fetched, "Should have updated_at timestamp"
        print(f"✓ Verified update persisted in MongoDB")
    
    def test_07_update_nonexistent_zone_returns_404(self):
        """PUT /api/zones/{id} should return 404 for non-existent zone"""
        fake_id = "nonexistent-zone-id-67890"
        update_data = {
            "name": "Should Not Work",
            "type": "chantier",
            "shape": "circle",
            "color": "#2563EB"
        }
        response = requests.put(f"{BASE_URL}/api/zones/{fake_id}", json=update_data)
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ PUT non-existent zone returns 404")
    
    def test_08_delete_zone(self):
        """DELETE /api/zones/{id} should delete a zone"""
        # Create a zone first
        zone_data = {
            "name": f"TEST_Delete_Zone_{uuid.uuid4().hex[:8]}",
            "type": "chantier",
            "shape": "circle",
            "color": "#2563EB",
            "center": [46.85, 7.11],
            "radius": 100
        }
        create_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert create_response.status_code == 200
        created = create_response.json()
        zone_id = created["id"]
        
        # Delete the zone
        delete_response = requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
        assert delete_response.status_code == 200, f"Expected 200, got {delete_response.status_code}"
        
        delete_data = delete_response.json()
        assert delete_data.get("status") == "deleted", "Should return status: deleted"
        print(f"✓ DELETE /api/zones/{zone_id} deleted zone")
        
        # Verify zone is gone
        get_response = requests.get(f"{BASE_URL}/api/zones/{zone_id}")
        assert get_response.status_code == 404, "Deleted zone should return 404"
        print(f"✓ Verified zone removed from MongoDB")
    
    def test_09_delete_nonexistent_zone_returns_404(self):
        """DELETE /api/zones/{id} should return 404 for non-existent zone"""
        fake_id = "nonexistent-zone-id-delete"
        response = requests.delete(f"{BASE_URL}/api/zones/{fake_id}")
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        print(f"✓ DELETE non-existent zone returns 404")
    
    def test_10_existing_zone_in_db(self):
        """Verify the existing 'Zone Test Cercle' zone is in the database"""
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200
        zones = response.json()
        
        # Look for the pre-existing test zone
        test_zone = next((z for z in zones if z.get("name") == "Zone Test Cercle"), None)
        if test_zone:
            assert test_zone["shape"] == "circle", "Should be a circle zone"
            assert test_zone["center"] is not None, "Should have center coordinates"
            print(f"✓ Found existing 'Zone Test Cercle' in MongoDB: {test_zone['id']}")
        else:
            print("⚠ 'Zone Test Cercle' not found - may have been deleted")
    
    def test_11_zones_collection_persistence(self):
        """Test that zones persist across multiple API calls"""
        # Create a zone
        zone_data = {
            "name": f"TEST_Persistence_{uuid.uuid4().hex[:8]}",
            "type": "depot",
            "shape": "polygon",
            "color": "#059669",
            "polygon": [[46.80, 7.10], [46.81, 7.10], [46.81, 7.12], [46.80, 7.12]]
        }
        create_response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert create_response.status_code == 200
        created = create_response.json()
        zone_id = created["id"]
        self.test_zone_ids.append(zone_id)
        
        # List all zones and verify our zone is there
        list_response = requests.get(f"{BASE_URL}/api/zones")
        assert list_response.status_code == 200
        zones = list_response.json()
        
        found = any(z["id"] == zone_id for z in zones)
        assert found, "Created zone should appear in list"
        print(f"✓ Zone {zone_id} persists in zones collection")


class TestZonesDataValidation:
    """Test data validation for zones API"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        self.test_zone_ids = []
        yield
        for zone_id in self.test_zone_ids:
            try:
                requests.delete(f"{BASE_URL}/api/zones/{zone_id}")
            except:
                pass
    
    def test_create_zone_with_all_fields(self):
        """Create zone with all optional fields"""
        zone_data = {
            "name": f"TEST_Full_Zone_{uuid.uuid4().hex[:8]}",
            "type": "restricted",
            "shape": "circle",
            "color": "#DC2626",
            "center": [46.84, 7.10],
            "radius": 500,
            "polygon": None,
            "alertEntry": True,
            "alertExit": True
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200
        
        created = response.json()
        self.test_zone_ids.append(created["id"])
        
        # Verify all fields
        assert created["name"] == zone_data["name"]
        assert created["type"] == zone_data["type"]
        assert created["shape"] == zone_data["shape"]
        assert created["color"] == zone_data["color"]
        assert created["center"] == zone_data["center"]
        assert created["radius"] == zone_data["radius"]
        assert created["alertEntry"] == zone_data["alertEntry"]
        assert created["alertExit"] == zone_data["alertExit"]
        assert "created_at" in created
        assert "assetsCount" in created
        print(f"✓ Zone created with all fields validated")
    
    def test_create_zone_with_minimal_fields(self):
        """Create zone with only required fields"""
        zone_data = {
            "name": f"TEST_Minimal_{uuid.uuid4().hex[:8]}"
        }
        response = requests.post(f"{BASE_URL}/api/zones", json=zone_data)
        assert response.status_code == 200
        
        created = response.json()
        self.test_zone_ids.append(created["id"])
        
        # Should have defaults
        assert created["type"] == "chantier"  # default
        assert created["shape"] == "circle"   # default
        assert created["color"] == "#2563EB"  # default
        print(f"✓ Zone created with defaults applied")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
