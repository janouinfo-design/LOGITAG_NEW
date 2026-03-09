  export function calculateDistance(latlng1, latlng2) {
      const R = 6371; // Radius of the Earth in km
      const dLat = (latlng2.lat - latlng1.lat) * Math.PI / 180;
      const dLon = (latlng2.lng - latlng1.lng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(latlng1.lat * Math.PI / 180) * Math.cos(latlng2.lat * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
  }