import {useState} from 'react'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'
import {Dropdown} from 'primereact/dropdown'
import {InputTextarea} from 'primereact/inputtextarea'
// import Map from "../Map/Map";

const NewBookingForm = ({vehicle, hour, onClose}) => {
  const [formData, setFormData] = useState({
    startDate: '20.02.2025',
    startTime: '12:51',
    endDate: '20.02.2025',
    endTime: '13:51',
    driver: null,
    startBase: null,
    transmission: 'any',
    vehicleType: 'any',
    seats: 'any',
    notes: '',
  })

  return (
    <div className='grid grid-cols-2 gap-6 h-90vh'>
      <div className='space-y-8 p-6'>
        <div>
          <h2 className='text-xl font-medium text-900 mb-6'>Détails du voyage</h2>

          <div className='space-y-6'>
            <div>
              <div className='text-sm font-medium mb-2'>Durée</div>
              <div className='space-y-4'>
                <div>
                  <div className='text-sm text-500 mb-1'>Depuis</div>
                  <div className='flex gap-2'>
                    <div className='flex-1'>
                      <InputText value={formData.startDate} className='w-full' />
                    </div>
                    <div className='flex-1'>
                      <InputText value={formData.startTime} className='w-full' />
                    </div>
                  </div>
                </div>
                <div>
                  <div className='text-sm text-500 mb-1'>À</div>
                  <div className='flex gap-2'>
                    <div className='flex-1'>
                      <InputText value={formData.endDate} className='w-full' />
                    </div>
                    <div className='flex-1'>
                      <InputText value={formData.endTime} className='w-full' />
                    </div>
                  </div>
                </div>
                <div className='text-sm text-500'>Booking time: 1h</div>
              </div>
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Conducteur</div>
              <Dropdown
                options={[
                  {label: 'Pilot 1', value: 'pilot1'},
                  {label: 'Pilot 2', value: 'pilot2'},
                ]}
                placeholder='Sélectionnez le pilote'
                className='w-full'
                value={formData.driver}
                onChange={(e) => setFormData({...formData, driver: e.value})}
              />
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Détails de l'itinéraire</div>
              <div className='space-y-2'>
                <div className='flex align-items-center gap-2 p-2 border-1 border-round'>
                  <div className='bg-green-100 p-1 border-round'>
                    <i className='pi pi-map-marker text-green-600' style={{fontSize: '1rem'}}></i>
                  </div>
                  <Dropdown
                    options={[
                      {label: 'Base 1', value: 'base1'},
                      {label: 'Base 2', value: 'base2'},
                    ]}
                    placeholder='Base de départ'
                    className='w-full border-none p-0'
                    value={formData.startBase}
                    onChange={(e) => setFormData({...formData, startBase: e.value})}
                  />
                </div>
                <div className='flex align-items-center gap-2'>
                  <div className='flex-1'>
                    <InputText placeholder='Rechercher une adresse' className='w-full' />
                  </div>
                  <Button icon='pi pi-times' text rounded />
                </div>
                <Button
                  label='Ajouter un arrêt'
                  text
                  icon='pi pi-plus'
                  className='w-full justify-content-start text-primary hover:text-primary-600 hover:bg-primary-50'
                />
              </div>
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Transmission</div>
              <div className='flex gap-1'>
                <Button
                  label="N'importe lequel"
                  className={`flex-1 ${
                    formData.transmission === 'any' ? 'bg-primary text-white border-primary' : ''
                  }`}
                  onClick={() => setFormData({...formData, transmission: 'any'})}
                />
                <Button
                  label='Manuel'
                  outlined={formData.transmission !== 'manual'}
                  className='flex-1'
                  onClick={() => setFormData({...formData, transmission: 'manual'})}
                />
                <Button
                  label='Automatique'
                  outlined={formData.transmission !== 'auto'}
                  className='flex-1'
                  onClick={() => setFormData({...formData, transmission: 'auto'})}
                />
              </div>
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Type de véhicule</div>
              <Dropdown
                options={[
                  {label: "N'importe lequel", value: 'any'},
                  {label: 'Berline', value: 'sedan'},
                  {label: 'SUV', value: 'suv'},
                ]}
                placeholder="N'importe lequel"
                className='w-full'
                value={formData.vehicleType}
                onChange={(e) => setFormData({...formData, vehicleType: e.value})}
              />
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Des places</div>
              <Dropdown
                options={[
                  {label: "N'importe lequel", value: 'any'},
                  {label: '2 places', value: '2'},
                  {label: '4 places', value: '4'},
                  {label: '5 places', value: '5'},
                ]}
                placeholder="N'importe lequel"
                className='w-full'
                value={formData.seats}
                onChange={(e) => setFormData({...formData, seats: e.value})}
              />
            </div>

            <div>
              <div className='text-sm font-medium mb-2'>Remarques</div>
              <InputTextarea
                className='w-full min-h-10rem resize-none'
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='h-full'>
        <div>Map</div>
      </div>
    </div>
  )
}

export default NewBookingForm
