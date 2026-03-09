import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import {InputTextarea} from 'primereact/inputtextarea'
import {useState} from 'react'

const MergeForm = ({save, visible = false, onHide, loading}) => {
  const [value, setValue] = useState('')

  const onSave = () => {
    save(value)
    setValue('')
  }

  return (
    <Dialog
      onHide={onHide}
      style={{width: '25vw'}}
      visible={visible}
      header={<OlangItem olang='Merge' />}
    >
      <div className='flex flex-col gap-6 w-full items-center justify-center'>
        <div className='flex flex-col gap-2 w-11/12'>
          <label className='text-lg font-semibold' htmlFor='email'>
            <OlangItem olang='Description' />
          </label>
          <InputTextarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={5}
            cols={30}
          />
        </div>

        <div className='w-full flex justify-center items-center mt-4'>
          <Button
            onClick={onSave}
            loading={loading}
            disabled={loading}
            className='w-11/12 gap-2 rounded-2xl flex flex-row items-center justify-center'
          >
            <OlangItem olang='Ajouter' />
          </Button>
        </div>
      </div>
    </Dialog>
  )
}

export default MergeForm
