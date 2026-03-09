import {Button} from 'primereact/button'
import {Tooltip} from 'primereact/tooltip'

const Header = ({onAddTime, onOpenSettings}) => {
  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 animate-fade-in'>
      <div className='flex items-center gap-2'>
        <h1 className='text-2xl font-semibold'>Temps de travail</h1>
        <span
          className='p-tooltip-target'
          data-pr-tooltip='Consultez et gérez le temps de travail de votre équipe'
          data-pr-position='right'
        >
          <i className='pi pi-info-circle text-muted-foreground hover:text-foreground transition-colors'></i>
        </span>
        <Tooltip target='.p-tooltip-target' />
      </div>
      <div className='flex items-center gap-3'>
        {/* <Button
          icon='pi pi-cog'
          className='p-button-rounded p-button-outlined p-button-sm border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100'
          onClick={onOpenSettings}
          pt={{
            root: {className: 'p-2'},
            icon: {className: 'text-sm'},
          }}
        /> */}
        <Button
          label='Ajouter du temps de travail'
          icon='pi pi-plus-circle'
          onClick={onAddTime}
          pt={{
            root: {
              className:
                'gap-1.5 bg-gradient-to-r from-primary to-primary-light hover:opacity-90 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-white px-4 py-2 rounded-md',
            },
            icon: {className: 'text-sm'},
            label: {className: 'text-sm font-medium'},
          }}
        />
      </div>
    </div>
  )
}

export default Header
