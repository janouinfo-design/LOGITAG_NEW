import {Dropdown} from 'primereact/dropdown'
import {Card, CardContent, CardHeader, CardTitle} from '../../ui/Card'
import {InputText} from 'primereact/inputtext'
import {Button} from 'primereact/button'
import {OlangItem} from '../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputSwitch} from 'primereact/inputswitch'

const FactureSetting = () => {
  return (
    <div className='space-y-6'>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
          Paramètres généraux
        </h1>
        <p className='text-muted-foreground mt-2'>
          Configurez les paramètres généraux de votre application
        </p>
      </header>

      <div className='grid gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Préférences Générales</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xl text-gray-800 font-semibold'>Langue</label>
                <Dropdown
                  className='h-[3rem] w-4/5'
                  value={null}
                  options={[]}
                  placeholder='Sélectionnez une langue'
                />
              </div>
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xl text-gray-800 font-semibold'>Fuseau horaire</label>
                <Dropdown
                  className='h-[3rem] w-4/5'
                  value={null}
                  options={[]}
                  placeholder='Sélectionnez un fuseau horaire'
                />
              </div>
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xl text-gray-800 font-semibold'>
                  <OlangItem olang='Changement.service' />
                </label>
                <InputSwitch checked={true} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xl text-gray-800 font-semibold'>Email de notification</label>
                <InputText type='email' placeholder='exemple@domaine.com' />
              </div>
              <div className='flex flex-col gap-2 mb-2'>
                <label className='text-xl text-gray-800 font-semibold'>
                  Fréquence des notifications
                </label>
                <Dropdown
                  className='h-[3rem] w-4/5'
                  value={null}
                  options={[]}
                  placeholder='Sélectionnez une langue'
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className='flex justify-end'>
          <Button>Enregistrer les modifications</Button>
        </div>
      </div>
    </div>
  )
}

export default FactureSetting
