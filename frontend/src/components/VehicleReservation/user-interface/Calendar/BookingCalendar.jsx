import {Card} from 'primereact/card'
import {Button} from 'primereact/button'
import {InputText} from 'primereact/inputtext'
import {Dialog} from 'primereact/dialog'
import {Checkbox} from 'primereact/checkbox'
import {Dropdown} from 'primereact/dropdown'
import {useState} from 'react'
import NewBookingForm from '../Bookings/NewBookingForm'
import {CalendarHeader} from './CalendarHeader'
import {TimeHeader} from './TimeHeader'
import {CalendarTimeline} from './CalendarTimeline'

const vehicles = [
  {
    id: 'A025',
    name: 'Toyota Yaris',
    status: 'Disponible',
    type: 'Citadine',
  },
  {
    id: 'A030',
    name: 'Renault Clio',
    status: 'En cours',
    type: 'Citadine',
  },
]

export const BookingCalendar = () => {
  const [activeTab, setActiveTab] = useState('calendar')
  const [addVehicleVisible, setAddVehicleVisible] = useState(false)
  const [newBookingVisible, setNewBookingVisible] = useState(false)
  const [selectAll, setSelectAll] = useState(false)

  const renderAddVehicleDialog = () => (
    <>
      <Button
        label='Ajouter Véhicule'
        icon='pi pi-plus-circle'
        onClick={() => setAddVehicleVisible(true)}
      />
      <Dialog
        header='Ajouter des véhicules'
        visible={addVehicleVisible}
        style={{width: '50vw'}}
        onHide={() => setAddVehicleVisible(false)}
        footer={
          <div>
            <Button label='Annuler' outlined onClick={() => setAddVehicleVisible(false)} />
            <Button label='Enregistrer' />
          </div>
        }
      >
        <div className='py-4'>
          <div className='relative'>
            <span className='p-input-icon-right'>
              <i className='pi pi-search' />
              <InputText placeholder='Chercher' className='w-full' />
            </span>
          </div>
          <div className='mt-4 flex gap-4 border-bottom-1'>
            <div className='flex align-items-center gap-2 pb-2'>
              <Checkbox
                inputId='selectAll'
                checked={selectAll}
                onChange={(e) => setSelectAll(e.checked)}
              />
              <label htmlFor='selectAll' className='text-sm'>
                Sélectionner tout
              </label>
            </div>
            <div className='flex gap-4 ml-8'>
              <button className='border-bottom-2 border-primary px-4 pb-2 text-sm text-primary'>
                Individuel
              </button>
              <button className='px-4 pb-2 text-sm text-600'>Groupes</button>
              <button className='px-4 pb-2 text-sm text-600'>Entrepôts</button>
            </div>
          </div>
          <div className='min-h-20rem'>{/* Zone de contenu pour les véhicules */}</div>
        </div>
      </Dialog>
    </>
  )

  const renderCalendar = () => (
    <Card>
      <CalendarHeader />
      <div className='flex flex-column'>
        <TimeHeader />
        <CalendarTimeline vehicles={vehicles} />
      </div>
    </Card>
  )

  const renderVehicleList = () => (
    <div className='space-y-4'>
      <div className='flex align-items-center gap-4'>
        <div className='space-y-1'>
          <div className='text-sm text-500'>Base</div>
          <Dropdown
            options={[
              {label: 'Depot Grisoni', value: 'depot1'},
              {label: 'Depot Central', value: 'depot2'},
            ]}
            placeholder='Select Depot'
            className='w-12rem'
          />
        </div>

        <div className='space-y-1'>
          <div className='text-sm text-500'>Statut</div>
          <Dropdown
            options={[
              {label: 'Tous les statuts', value: 'all'},
              {label: 'Disponible', value: 'available'},
              {label: 'En maintenance', value: 'maintenance'},
            ]}
            placeholder='Tous les statuts'
            className='w-12rem'
          />
        </div>
      </div>

      <Card>
        <div className='relative overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 text-600'>
              <tr>
                <th className='px-4 py-3'>Véhicule</th>
                <th className='px-4 py-3'>Année</th>
                <th className='px-4 py-3'>Base</th>
                <th className='px-4 py-3'>Odomètre</th>
                <th className='px-4 py-3'>Statut</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-car text-500'></i>
                    <div>
                      <div className='text-primary'>A025</div>
                      <div className='text-xs text-500'>-</div>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>-</td>
                <td className='px-4 py-3'>Depot Grisoni</td>
                <td className='px-4 py-3'>7'008,00km</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-green-100 text-green-800'>
                    Disponible
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <Button icon='pi pi-pencil' text />
                </td>
              </tr>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-car text-500'></i>
                    <div>
                      <div className='text-primary'>A030</div>
                      <div className='text-xs text-500'>Toyota Yaris</div>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>-</td>
                <td className='px-4 py-3'>Depot Grisoni</td>
                <td className='px-4 py-3'>3'806,00km</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-green-100 text-green-800'>
                    Disponible
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <Button icon='pi pi-pencil' text />
                </td>
              </tr>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <i className='pi pi-car text-500'></i>
                    <div>
                      <div className='text-primary'>A050</div>
                      <div className='text-xs text-500'>Toyota Procar City van</div>
                    </div>
                  </div>
                </td>
                <td className='px-4 py-3'>-</td>
                <td className='px-4 py-3'>Depot Grisoni</td>
                <td className='px-4 py-3'>3'637,00km</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-green-100 text-green-800'>
                    Disponible
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <Button icon='pi pi-pencil' text />
                </td>
              </tr>
            </tbody>
          </table>
          <div className='flex align-items-center justify-content-between px-4 py-3 bg-gray-50'>
            <div className='text-sm text-700'>
              Nombre de lignes :
              <Dropdown
                options={[
                  {label: '10', value: '10'},
                  {label: '20', value: '20'},
                  {label: '50', value: '50'},
                ]}
                value='10'
                className='w-5rem ml-2'
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  const renderBookingList = () => (
    <div className='space-y-4'>
      <div className='flex align-items-center gap-4'>
        <div className='space-y-1'>
          <div className='text-sm text-500'>Période</div>
          <div className='flex align-items-center gap-2'>
            <InputText value='17.02.2025 - 23.02.2025' className='w-12rem' />
            <Button icon='pi pi-chevron-left' outlined className='p-button-rounded p-button-sm' />
            <Button icon='pi pi-chevron-right' outlined className='p-button-rounded p-button-sm' />
          </div>
        </div>

        <div className='space-y-1'>
          <div className='text-sm text-500'>Base</div>
          <Dropdown
            options={[
              {label: 'Depot Grisoni', value: 'depot1'},
              {label: 'Depot Central', value: 'depot2'},
            ]}
            placeholder='Select Depot'
            className='w-12rem'
          />
        </div>

        <div className='space-y-1'>
          <div className='text-sm text-500'>Conducteur</div>
          <Dropdown
            options={[
              {label: 'Wilson Seb', value: 'driver1'},
              {label: 'Martin Paul', value: 'driver2'},
            ]}
            placeholder='Sélectionnez le pilote'
            className='w-12rem'
          />
        </div>

        <div className='space-y-1'>
          <div className='text-sm text-500'>Statut</div>
          <Dropdown
            options={[
              {label: 'Tous les statuts', value: 'all'},
              {label: 'Actif', value: 'active'},
              {label: 'Terminé', value: 'completed'},
            ]}
            placeholder='Tous les statuts'
            className='w-12rem'
          />
        </div>

        <div className='flex-1'>
          <span className='p-input-icon-left w-full max-w-18rem ml-auto'>
            <i className='pi pi-search' />
            <InputText placeholder='Rechercher...' className='w-full' />
          </span>
        </div>
      </div>

      <Card>
        <div className='relative overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='bg-gray-50 text-600'>
              <tr>
                <th className='px-4 py-3'>ID</th>
                <th className='px-4 py-3'>Véhicule</th>
                <th className='px-4 py-3'>Conducteur</th>
                <th className='px-4 py-3'>Période de réservation</th>
                <th className='px-4 py-3'>Base</th>
                <th className='px-4 py-3'>Arrêts</th>
                <th className='px-4 py-3'>Réservé par</th>
                <th className='px-4 py-3'>Remarques</th>
                <th className='px-4 py-3'>Statut</th>
                <th className='px-4 py-3'>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>27691</td>
                <td className='px-4 py-3'>A025</td>
                <td className='px-4 py-3'>Wilson Seb</td>
                <td className='px-4 py-3'>21.02.2025 - 22.02.2025</td>
                <td className='px-4 py-3'>Depot Grisoni</td>
                <td className='px-4 py-3'>0 Arrêts</td>
                <td className='px-4 py-3'>GRISONI GROUP</td>
                <td className='px-4 py-3'>-</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-green-100 text-green-800'>
                    Actif
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <Button
                      icon='pi pi-chevron-left'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                    <Button
                      icon='pi pi-chevron-right'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                  </div>
                </td>
              </tr>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>27692</td>
                <td className='px-4 py-3'>A030</td>
                <td className='px-4 py-3'>Martin Paul</td>
                <td className='px-4 py-3'>23.02.2025 - 23.02.2025</td>
                <td className='px-4 py-3'>Depot Central</td>
                <td className='px-4 py-3'>2 Arrêts</td>
                <td className='px-4 py-3'>GRISONI GROUP</td>
                <td className='px-4 py-3'>Livraison matériel</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-yellow-100 text-yellow-800'>
                    En attente
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <Button
                      icon='pi pi-chevron-left'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                    <Button
                      icon='pi pi-chevron-right'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                  </div>
                </td>
              </tr>
              <tr className='border-bottom-1'>
                <td className='px-4 py-3'>27693</td>
                <td className='px-4 py-3'>A031</td>
                <td className='px-4 py-3'>Dubois Jean</td>
                <td className='px-4 py-3'>22.02.2025 - 22.02.2025</td>
                <td className='px-4 py-3'>Depot Grisoni</td>
                <td className='px-4 py-3'>1 Arrêt</td>
                <td className='px-4 py-3'>GRISONI GROUP</td>
                <td className='px-4 py-3'>Visite chantier</td>
                <td className='px-4 py-3'>
                  <span className='inline-flex align-items-center px-2 py-1 border-round text-xs font-medium bg-green-100 text-green-800'>
                    Actif
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <div className='flex align-items-center gap-2'>
                    <Button
                      icon='pi pi-chevron-left'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                    <Button
                      icon='pi pi-chevron-right'
                      outlined
                      className='p-button-rounded p-button-sm'
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className='flex align-items-center justify-content-between px-4 py-3 bg-gray-50'>
            <div className='text-sm text-700'>
              Nombre de lignes :
              <Dropdown
                options={[
                  {label: '10', value: '10'},
                  {label: '20', value: '20'},
                  {label: '50', value: '50'},
                ]}
                value='10'
                className='w-5rem ml-2'
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className='space-y-6'>
      <div className='flex align-items-center justify-content-between'>
        <h1 className='text-2xl font-semibold'>Partage de voiture</h1>
        {activeTab !== 'vehicles' ? (
          <>
            <Button
              label='Nouvelle réservation'
              icon='pi pi-plus-circle'
              onClick={() => setNewBookingVisible(true)}
            />
            <Dialog
              header='Nouvelle réservation'
              visible={newBookingVisible}
              style={{width: '80vw', height: '90vh'}}
              onHide={() => setNewBookingVisible(false)}
              position='bottom-right'
            >
              <NewBookingForm />
            </Dialog>
          </>
        ) : (
          renderAddVehicleDialog()
        )}
      </div>

      <div className='flex border-bottom-1'>
        <button
          className={`px-4 py-2 border-bottom-2 ${
            activeTab === 'calendar'
              ? 'border-primary text-primary'
              : 'border-transparent text-600 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendrier de réservation
        </button>
        <button
          className={`px-4 py-2 border-bottom-2 ${
            activeTab === 'list'
              ? 'border-primary text-primary'
              : 'border-transparent text-600 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('list')}
        >
          Réservations
        </button>
        <button
          className={`px-4 py-2 border-bottom-2 ${
            activeTab === 'vehicles'
              ? 'border-primary text-primary'
              : 'border-transparent text-600 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('vehicles')}
        >
          Véhicules
        </button>
      </div>

      {activeTab === 'calendar' && renderCalendar()}
      {activeTab === 'list' && renderBookingList()}
      {activeTab === 'vehicles' && renderVehicleList()}
    </div>
  )
}
