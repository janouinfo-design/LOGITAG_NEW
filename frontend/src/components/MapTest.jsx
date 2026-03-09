import React from 'react'
import L from 'leaflet'
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'
import {addressPoints} from './shared/MapComponent/user-interface/dataTest'
import RedIcon from '../assets/icons/marker.png'
import BaseMapLayerComponent from './shared/BaseMapLayerComponent/BaseMapLayerComponent'
import ButtonComponent from './shared/ButtonComponent/ButtonComponent'
import {OlangItem} from './shared/Olang/user-interface/OlangItem/OlangItem'
import {Image} from 'primereact/image'
import {Checkbox} from 'primereact/checkbox'
import {InputText} from 'primereact/inputtext'

const customIcon = new L.Icon({
  iconUrl: RedIcon,
  iconSize: [60, 60],
})

const MapTest = () => {
  const piosList = [
    {
      label: 'Group 1',
      items: [
        {
          id: '1',
          label: 'Pio 1',
          etatengin: 'Active',
          locationDate: '2024-11-01',
          statuslabel: 'Operational',
          iconName: 'pi pi-check',
          etatIconName: 'pi pi-check-circle',
          etatbgColor: '#4CAF50',
          statusbgColor: '#2196F3',
          tagId: true,
          familleTag: 'Family A',
          familleIconTag: 'pi pi-tag',
          familleTagIconBgcolor: '#FFC107',
          LocationID: 'Location1',
          LocationObjectname: 'Warehouse A',
          distanceTo: 5,
          distanceUnit: 'km',
          uid: 'UID-1',
        },
        {
          id: '2',
          label: 'Pio 2',
          etatengin: 'Inactive',
          locationDate: '2024-10-28',
          statuslabel: 'Under Maintenance',
          iconName: 'pi pi-wrench',
          etatIconName: 'pi pi-exclamation-circle',
          etatbgColor: '#FFC107',
          statusbgColor: '#FF5722',
          tagId: false,
          LocationID: 'Location2',
          LocationObjectname: 'Depot B',
          distanceTo: 12,
          distanceUnit: 'km',
          uid: 'UID-2',
        },
      ],
    },
    {
      label: 'Group 2',
      items: [
        {
          id: '3',
          label: 'Pio 3',
          etatengin: 'Active',
          locationDate: '2024-11-05',
          statuslabel: 'Operational',
          iconName: 'pi pi-check',
          etatIconName: 'pi pi-check-circle',
          etatbgColor: '#4CAF50',
          statusbgColor: '#2196F3',
          tagId: true,
          familleTag: 'Family B',
          familleIconTag: 'pi pi-tag',
          familleTagIconBgcolor: '#03A9F4',
          LocationID: 'Location3',
          LocationObjectname: 'Facility C',
          distanceTo: 3,
          distanceUnit: 'km',
          uid: 'UID-3',
        },
      ],
    },
  ]

  const pios = [
    {
      id: '1',
      label: 'Pio 1',
      etatengin: 'Active',
      locationDate: '2024-11-01',
      statuslabel: 'Operational',
      iconName: 'pi pi-check',
      etatIconName: 'pi pi-check-circle',
      etatbgColor: '#4CAF50',
      statusbgColor: '#2196F3',
      tagId: true,
      familleTag: 'Family A',
      familleIconTag: 'pi pi-tag',
      familleTagIconBgcolor: '#FFC107',
      LocationID: 'Location1',
      LocationObjectname: 'Warehouse A',
      distanceTo: 5,
      distanceUnit: 'km',
      uid: 'UID-1',
    },
    {
      id: '2',
      label: 'Pio 2',
      etatengin: 'Inactive',
      locationDate: '2024-10-28',
      statuslabel: 'Under Maintenance',
      iconName: 'pi pi-wrench',
      etatIconName: 'pi pi-exclamation-circle',
      etatbgColor: '#FFC107',
      statusbgColor: '#FF5722',
      tagId: false,
      LocationID: 'Location2',
      LocationObjectname: 'Depot B',
      distanceTo: 12,
      distanceUnit: 'km',
      uid: 'UID-2',
    },
    {
      id: '3',
      label: 'Pio 3',
      etatengin: 'Active',
      locationDate: '2024-11-05',
      statuslabel: 'Operational',
      iconName: 'pi pi-check',
      etatIconName: 'pi pi-check-circle',
      etatbgColor: '#4CAF50',
      statusbgColor: '#2196F3',
      tagId: true,
      familleTag: 'Family B',
      familleIconTag: 'pi pi-tag',
      familleTagIconBgcolor: '#03A9F4',
      LocationID: 'Location3',
      LocationObjectname: 'Facility C',
      distanceTo: 3,
      distanceUnit: 'km',
      uid: 'UID-3',
    },
  ]

  const poiInfos = {
    reference: 'POI-12345',
    lastSeenAt: '2024-11-05 14:23',
    statuslabel: 'Operational',
    iconName: 'pi pi-check-circle',
    statusbgColor: '#4CAF50', // Green color for operational status
    batteries: 85, // Battery level in percentage
    sysMode: 'device', // System mode (e.g., 'gateway' or 'device')
    lastUser: 'John Doe',
    etatengin: 'Active',
    etatIconName: 'pi pi-check-circle',
    etatbgColor: '#4CAF50', // Background color for 'Active' state
    LocationObjectname: 'Main Warehouse',
    locationDate: '2024-11-04',
    lastDetectionMode: 'mob', // Indicates "mobile" mode
    enginAddress: '1234 Warehouse St, Industrial Park, Cityville',
  }

  return (
    <div className='w-full relative'>
      <div
        style={{
          position: 'absolute',
          height: '400px',
          minWidth: '100%',
          width: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {Array.isArray(piosList) && Array.isArray(pios) && (
          <div
            className='p-2 '
            style={{
              position: 'absolute',
              transition: 'all 1s',
              cursor: 'auto',
              width: 'auto',
              height: '62vh',
              zIndex: 4,
              top: '0.5rem',
              left: '0.5rem',
            }}
          >
            {true ? (
              <div className='flex gap-2'>
                <div className='bg-white' style={{width: '400px'}}>
                  <div className=' p-2 border-bottom-1 border-gray-100 py-2 flex align-items-center justify-content-between'>
                    <span
                      className='pi pi-align-left'
                      //   onClick={() => setShowPios((prev) => !prev)}
                      title='Cacher liste'
                    ></span>
                    <span
                      //   onClick={() => setShowFilterOptions((p) => !p)}
                      className='pi pi-cog'
                      title='Options de filtre'
                    ></span>
                  </div>
                  <div className='p-2 border-bottom-1 border-gray-100 py-2'>
                    <span className='p-input-icon-right p-input-icon-left  w-full '>
                      <i className='pi pi-search' />
                      <InputText
                        // onChange={(e) => onFilter(e.target.value)}
                        className='w-full border-0'
                        placeholder='Search'
                      />
                    </span>
                  </div>
                  <div className='flex w-full flex-row align-items-center justify-content-between bg-blue-100 mr-2'>
                    <strong className='p-2'>
                      <OlangItem olang='lst.eng' />({piosList?.[0]?.items?.length || 0})
                    </strong>
                  </div>
                  <div style={{maxHeight: '53vh', overflow: 'auto'}}>
                    {piosList.map((_pio) => (
                      <div>
                        <div className='px-2 py-2 hover:bg-blue-100   flex gap-2 align-items-center justify-content-between  bg-blue-50'>
                          <div className='flex gap-2 align-items-center '>
                            <Checkbox
                              //   onChange={(e) =>
                              //     toggleSelectPioGroup(
                              //       _pio.label,
                              //       !selectedPioGroups.includes(_pio.label)
                              //     )
                              //   }
                              checked={true}
                            />
                            <strong style={{fontSize: '15px'}} className='text-blue-500'>
                              {_pio.label}
                            </strong>
                          </div>
                          <div>
                            <span className='pi pi-chevron-down'></span>
                          </div>
                        </div>
                        <div className=''>
                          {(_pio.items || []).map((pio) => (
                            <div
                              //onMouseEnter={(e) => setCurrentHoveredItem(pio.id)}
                              //onMouseLeave={(e) => setCurrentHoveredItem(null)}
                              className='px-3 shadow-1 my-2 hover:shadow-3 hover:bg-indigo-100 border-left-3 border-blue-300  py-3 flex gap-2 align-items-center justify-content-between'
                              style={{
                                height: '50px',
                                marginBottom: '1px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '5px',
                                border: 'none',
                              }}
                            >
                              <div
                                className='flex gap-2 align-items-center'
                                style={{minWidth: '50%'}}
                              >
                                {/* checkbox */}
                                <div className='checkbox'>
                                  <Checkbox
                                    // onChange={(e) =>
                                    //   toggleSelectPio(pio.id, !selectedPioIds.includes(pio.id))
                                    // }
                                    checked={true}
                                  />
                                </div>
                                {/* image */}
                                <div className='image'>
                                  <div
                                    style={{fontSize: '15px', width: '180px'}}
                                    // onClick={(e) =>
                                    //   toggleSelectPio(pio.id, !selectedPioIds.includes(pio.id))
                                    // }
                                  >
                                    {pio.label}
                                  </div>
                                </div>
                                {/* mouvement status */}
                                <div className='mouvement-status mx-1'>
                                  <i
                                    title={`${pio?.etatengin} ${pio?.locationDate}`}
                                    className={pio.etatIconName + ' text-xl'}
                                    style={{color: pio.etatbgColor, fontSize: '12px'}}
                                  />
                                </div>
                                {/* Status engin */}
                                <div className='status-engin mx-1'>
                                  <i
                                    title={pio?.statuslabel}
                                    className={pio.iconName + ' text-xl'}
                                    style={{color: pio.statusbgColor, fontSize: '12px'}}
                                  />
                                </div>
                                {/* famille tag */}
                                <div className='tag-famille mx-1'>
                                  {pio.tagId ? (
                                    <i
                                      title={pio?.familleTag}
                                      className={pio.familleIconTag + ' text-xl'}
                                      style={{color: pio.familleTagIconBgcolor}}
                                    />
                                  ) : (
                                    <span className='badge badge-secondary border-radius-2'>
                                      <OlangItem olang='No.tag' />
                                    </span>
                                  )}
                                </div>
                                {pio?.LocationID && (
                                  <div>
                                    <i
                                      //   onClick={() => getGeoAndDisplay(pio)}
                                      title={pio?.LocationObjectname}
                                      className={
                                        'fa fa-light fa-map-location-dot text-xl cursor-pointer hover:text-blue-500'
                                      }
                                      style={{
                                        fontSize: '12px',
                                        color: '#00a5cf',
                                      }}
                                    />
                                  </div>
                                )}
                                <div class='mx-2 flex'>
                                  {/* distance */}
                                  {!isNaN(pio?.distanceTo) && (
                                    <span className='mr-2 text-sm '>
                                      {pio?.distanceTo} {pio?.distanceUnit}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* detail engin */}
                              <div className='flex gap-4'>
                                <span
                                  className='pi pi-info-circle cursor-pointer'
                                  //   onClick={() => getDetailEngin(pio)}
                                ></span>
                                {/* <span className='pi pi-ellipsis-v'></span> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {poiInfos && (
                  <div className='pio-detail-component relative'>
                    {true && (
                      <div>
                        <span
                          className='pi pi-times absolute text-red-500 cursor-pointer'
                          //   onClick={(e) => {
                          //     setPioInfos(null)
                          //     setSelectedPio(null)
                          //   }}
                          style={{top: '10px', right: '10px', fontSize: '20px', zIndex: 10}}
                        ></span>
                        <div className=' bg-white' style={{width: '400px'}}>
                          <div className='p-2'>
                            <div className='flex justify-content-between'>
                              <div className='flex gap-6 align-items-center flex-row'>
                                <strong>{poiInfos?.reference}</strong>
                                {poiInfos?.lastSeenAt && (
                                  <div className='flex gap-2 align-items-center'>
                                    <strong>{poiInfos?.lastSeenAt || ''}</strong>
                                    <div>
                                      (<OlangItem olang='last.seen' />)
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                <span className='pi pi-cog'></span>
                              </div>
                            </div>
                            <div className='flex gap-4 flex-wrap mt-4'>
                              <div className='flex gap-2 align-items-center'>
                                <i
                                  title={poiInfos?.statuslabel}
                                  className={poiInfos.iconName + ' text-xl'}
                                  style={{color: poiInfos.statusbgColor}}
                                />
                                <strong>{poiInfos?.statuslabel}</strong>
                              </div>
                              <div className='flex gap-2  align-items-center'>
                                <i className='fa-solid fa-battery-full text-green-500'></i>
                                <strong>
                                  {poiInfos?.batteries > 100 ? '100%' : poiInfos?.batteries + '%'}
                                </strong>
                              </div>
                              <div className='flex gap-2 align-items-center'>
                                <span className='pi pi-wifi  text-green-500'></span>
                                <strong>{'Good'}</strong>
                              </div>
                              {!poiInfos?.sysMode === 'gateway' && (
                                <div className='flex gap-2 align-items-center'>
                                  <span className='pi pi-user text-green-500'></span>
                                  <strong>{poiInfos?.lastUser}</strong>
                                </div>
                              )}
                            </div>
                            <div className='mt-4'>
                              <div className='flex gap-2 mb-3 align-items-center'>
                                <div className='w-1'>
                                  <i
                                    title={poiInfos?.etatengin}
                                    className={poiInfos.etatIconName + ' text-2xl'}
                                    style={{color: poiInfos.etatbgColor}}
                                  ></i>
                                </div>
                                <div className='w-11'>
                                  <strong className='text-lg'>
                                    {poiInfos?.LocationObjectname}
                                  </strong>
                                  <span className='text-gray-600 pl-2'>
                                    {poiInfos?.locationDate}
                                  </span>
                                </div>
                              </div>
                              <div className='flex gap-2 mb-3 align-items-center'>
                                <strong className='pl-2'>
                                  <OlangItem olang='Mode' /> {poiInfos?.lastDetectionMode}
                                </strong>
                                <span
                                  className={`${
                                    poiInfos?.lastDetectionMode == 'mob'
                                      ? 'pi pi-mobile text-lg text-green-500 pl-2'
                                      : null
                                  }`}
                                ></span>
                              </div>
                              <div className='flex gap-2 mb-3 align-items-center'>
                                <OlangItem olang='Address' />
                                <strong className='pl-2'>{poiInfos?.enginAddress}</strong>
                              </div>
                              <div className='flex gap-2 mb-3 align-items-center'>
                                {/* <div className='flex gap-2 align-items-center'>
                                  <strong>Mode: mobile</strong>
                                  <span className='pi pi-mobile text-lg text-green-500'></span>
                                </div> */}
                                {false && (
                                  <div className='w-11'>
                                    <strong className='block text-lg'>Test</strong>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <ButtonComponent
                icon='pi pi-align-left'
                // onClick={() => setShowPios((prev) => !prev)}
                title='Liste des engins'
              />
            )}
          </div>
        )}
      </div>
      <MapContainer
        style={{height: '100vh', width: '100%'}}
        center={[-41.975762, 172.934298]}
        zoom={4}
        scrollWheelZoom={true}
      >
        {/* <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        /> */}
        <BaseMapLayerComponent top={60} right={15} />
        <MarkerClusterGroup>
          {addressPoints?.map((address, index) => (
            <Marker
              icon={customIcon}
              key={index}
              position={[address[0], address[1]]}
              title={address[2]}
            >
              <Popup>
                <div>
                  <p>{address[2]}</p>
                  <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Possimus minima quo
                    dolore, perferendis, maxime quidem vitae repudiandae voluptatum qui beatae rem
                    dignissimos provident magnam veritatis placeat, consequatur inventore.
                    Repellendus, magni.
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  )
}

export default MapTest
