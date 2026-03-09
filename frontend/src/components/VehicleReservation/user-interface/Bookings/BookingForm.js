import {Button} from 'primereact/button'
import {Card} from 'primereact/card'
import {InputText} from 'primereact/inputtext'
import {Dropdown} from 'primereact/dropdown'

export const BookingForm = () => {
  return (
    <Card title='Nouvelle réservation'>
      <div className='p-fluid'>
        <form className='space-y-4'>
          <div className='field'>
            <label htmlFor='driver'>Conducteur</label>
            <Dropdown
              id='driver'
              options={[
                {label: 'John Doe', value: 'john'},
                {label: 'Jane Smith', value: 'jane'},
              ]}
              placeholder='Sélectionnez le conducteur'
            />
          </div>
          <div className='field'>
            <label htmlFor='vehicle'>Véhicule</label>
            <Dropdown
              id='vehicle'
              options={[
                {label: 'A025 - Toyota Yaris', value: 'a025'},
                {label: 'A030 - Renault Clio', value: 'a030'},
              ]}
              placeholder='Sélectionnez le véhicule'
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='field'>
              <label htmlFor='start'>Date de début</label>
              <InputText type='datetime-local' id='start' />
            </div>
            <div className='field'>
              <label htmlFor='end'>Date de fin</label>
              <InputText type='datetime-local' id='end' />
            </div>
          </div>
          <div className='flex justify-content-end'>
            <Button label='Réserver' />
          </div>
        </form>
      </div>
    </Card>
  )
}
