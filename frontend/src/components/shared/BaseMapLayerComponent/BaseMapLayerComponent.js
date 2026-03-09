import {useLeafletContext} from '@react-leaflet/core'
import {TileLayer} from 'react-leaflet'
import baselayers, {defaultLayer} from './baselayers'
import {Checkbox} from 'primereact/checkbox'
import {useEffect, useState} from 'react'

/* eslint-disable */
function BaseMapLayerComponent({top, left, right, bottom, zIndex, showSat}) {
  const context = useLeafletContext()
  const getContainer = () => context.layerContainer || context.map
  const [selectedBase, setSelectedBase] = useState('street')
  const [selectedBaseParams, setSelectedBaseParams] = useState({})
  const [showPanel, setShowPanel] = useState(false)
  useEffect(() => {
    let selected = baselayers.find((s) => s.title == selectedBase)
    selected = selected || defaultLayer
    setSelectedBaseParams(selected)
  }, [selectedBase])


  return (
    <div className='' style={{position: 'relative'}}>
      {selectedBaseParams?.uri && (
        <TileLayer
          maxNativeZoom={18}
          minZoom={1}
          maxZoom={22}
          attribution='&copy openstreetmap'
          url={selectedBaseParams?.uri}
          subdomains={selectedBaseParams?.params?.subdomains || []}
        />
      )}

      {!showSat ? (
        <div
          className=''
          style={{
            position: 'absolute',
            width: 'auto',
            zIndex: zIndex || 4,
            top: top + 'px',
            right: right + 'px',
            left: left + 'px',
            bottom: bottom + 'px',
          }}
        >
          <div
            onMouseEnter={(e) => setShowPanel(true)}
            onMouseLeave={(e) => setShowPanel(false)}
            style={{display: 'flex', flexDirection: 'column', gap: 10, padding: '.5rem'}}
          >
            <div
              className='shadow-2'
              onClick={() => setShowPanel((v) => !v)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 7,
                justifyContent: 'center',
                borderRadius: '1rem',
                padding: '.5rem',
                gap: 5,
                background: '#fff',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  backgroundImage: `url(${selectedBaseParams?.image})`,
                  width: '60px',
                  height: '60px',
                  borderRadius: '1rem',
                  background: '#eee',
                }}
              ></div>
              {/* <span style={{fontSize: '14px' }}>{selectedBaseParams?.label}</span> */}
            </div>
            {showPanel && (
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                {baselayers.map((lyr) => (
                  <div
                    onClick={() => setSelectedBase(lyr.title)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7,
                      justifyContent: 'center',
                      borderRadius: '1rem',
                      padding: '.5rem',
                      gap: 5,
                      background: '#fff',
                      alignItems: 'center',
                    }}
                  >
                    {lyr?.image && (
                      <img
                        src={lyr?.image}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '1rem',
                          background: '#eee',
                        }}
                      />
                    )}
                    {!lyr?.image && (
                      <div
                        src={lyr?.image}
                        style={{
                          backgroundImage: `url("${lyr?.image}")`,
                          width: '60px',
                          height: '60px',
                          borderRadius: '1rem',
                          background: '#eee',
                        }}
                      ></div>
                    )}
                    <span
                      style={{
                        fontSize: '14px',
                        color: selectedBase == lyr.title ? 'blue' : '#8e8e8e',
                      }}
                    >
                      {lyr.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default BaseMapLayerComponent
