import turf from '@turf/turf'

export function getNearestLayers(latlng , layers){
    
}

export function isPointInLayer(latlng , layer){
     latlng = turf.point(Array.isArray(latlng) ? latlng :[latlng.lng , latlng.lat]);
     return turf.inside(latlng , layer);
}

export function findContainedLayer(latlng , layers , geometryKey){
    try{
        return layers.find( layer => {
            let point = turf.point(Array.isArray(latlng) ? latlng :[latlng.lng , latlng.lat]);
            if(geometryKey) layer = layer?.[geometryKey];
            return turf.inside(point , layer)
        })
    }catch(e){
       return null
    }
}