import React, { useEffect, useState } from 'react'
import '@geoman-io/leaflet-geoman-free'
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css'
import { useLeafletContext } from '@react-leaflet/core'
const buttonActions = ['circleMarker', 'marker' , 'polygon' , 'polyline' , 'rectangle' , 'text' ]
const GeomanComponent = ({show , actions , disabledActions}) => {
  const context = useLeafletContext();
  const getContainer = ()=> context.layerContainer || context.map
  const [editCancelMode , setEditCancelMode] = useState(false)
  const [removalCancelMode , setRemovalCancelMode] = useState(false)
  const [visible , setVisible] = useState(true);
  const onEditModeToggle = (e)=> {
    if(!e.enabled){
         if(editCancelMode){
         }else{
            e.map.fire('pm:editFinished')
         }
    }else{
        setEditCancelMode(false)
        let data = e.map.pm.getGeomanLayers();
    }
  }
  const onRemovalModeToggle = (e)=> {
  }
  useEffect(()=> {
       const container = getContainer();
       if(show){
        let disabledObjs = {

        }

        let disabled = [];

        if(Array.isArray(actions)) {
          disabled = buttonActions.filter( b => !actions.includes(b) )
        }
        else if(Array.isArray(disabledActions)){
          disabled = [...disabledActions]
        }

        disabled = disabled.filter( t => typeof t == 'string')

        disabledObjs = disabled.reduce((c,v)=> {
              let slice = v.split('');
              v = slice.map( (a , index) => index == 0 ? a.toUpperCase() : a ).join('')
              c['draw'+v] = false

              return c
           }, {})
        container.pm.addControls({
            position: 'topright',
            oneBlock: true,
            ...disabledObjs
         })
       }else{
        container.pm.removeControls()
       }
       

    //    container.pm.Draw.CircleMarker.setOptions({
    //      editable: true
    //    })

    // container.pm.enableGlobalEditMode({
    //     allowSelfIntersection: false 
    // })
    // container.on('pm:globaleditmodetoggled' , onEditModeToggle)
    // container.on('pm:globalremovalmodetoggled' , onRemovalModeToggle)
  }, [context , show , actions , disabledActions])
  return null
}

export default GeomanComponent
