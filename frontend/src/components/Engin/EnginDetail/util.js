import L from 'leaflet'

export const arrowPolyline = L.Polyline.extend({
    addArrows(increment = 90 , options) {

      if(options?.arrowUrl)
         this.arrowUrl = options?.arrowUrl

      var points = this.getLatLngs()

    //   increment = this.getIncrement(this.map.getZoom())
      
      let features = [];
      for (var p = 0; p + 1 < points.length; p += increment) {
        if (!points[p] || !points[p + 1]) continue
        var diffLat = points[p + 1]["lat"] - points[p]["lat"];
        var diffLng = points[p + 1]["lng"] - points[p]["lng"];
        var center = [points[p]["lat"] + diffLat / 6, points[p]["lng"] + diffLng / 6]

        var angle = 360 - (Math.atan2(diffLat, diffLng) * 57.295779513082)

        features.push(L.marker(center, {
          icon: this.arrowIcon(angle)
        }))
      }

      if (this.arrowFeatures) {
        this.arrowFeatures.clearLayers()
      }

      for (const o of features) this.arrowFeatures.addLayer(o)
    },
    removeArrows() {
      if (this.arrowFeatures) {
        this.arrowFeatures.clearLayers()
      }
    },
    arrowIcon(angle , url) {
      return new L.divIcon({
        className: "arrowIcon",
        iconSize: new L.Point(30, 30),
        iconAnchor: new L.Point(15, 15),
        html: `<div style = 'color:#fff;font-size: 20px; -webkit-transform: rotate(${angle}deg)'>
             ${this.arrowUrl ? `<img src="${this.arrowUrl}" style="width: 20px ; height: 20px"/>`: "&#10152;"} 
          </div>`
      })
    },
    addTo(map, options) {
      map.addLayer(this);
      map.on('zoom', e => {
         this.addArrows()
      })

      this.realMap = options?.map || map
      this.arrowFeatures = L.featureGroup().addTo(this.realMap);
      this.map = map
      if (options?.draw) {
        this.addArrows()
      }
      if(options?.arrowUrl)
         this.arrowUrl = options?.arrowUrl

      return this;
    },
    getIncrement(zoom) {
      let z = 300;

      if (zoom > 7 && zoom <= 10)
        z = 150

      if (zoom > 10 && zoom <= 14)
        z = 50

      if (zoom > 14)
        z = zoom

      return Math.ceil(z / zoom) * 10
    },
    arrowFeatures: L.featureGroup(),
    map: null
});