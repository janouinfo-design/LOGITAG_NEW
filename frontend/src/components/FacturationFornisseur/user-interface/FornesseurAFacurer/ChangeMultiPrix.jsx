import {Button} from 'primereact/button'
import {Dialog} from 'primereact/dialog'
import {InputNumber} from 'primereact/inputnumber'
import {useState} from 'react'

const ChangeMultiPrix = ({visible, onHide, onSave, loading}) => {
  const [multiPrice, setMultiPrice] = useState(0)

  const handleSave = () => {
    onSave(multiPrice)
    setMultiPrice(0)
  }

  const footer = () => {
    return (
      <div className='flex align-items-center justify-content-end gap-2'>
        <Button label='Annuler' className='p-button-danger' onClick={onHide} />
        <Button
          label='Enregistrer'
          loading={loading}
          disabled={loading}
          className='p-button-success '
          onClick={handleSave}
        />
      </div>
    )
  }

  return (
    <Dialog
      header='Changer le prix'
      visible={visible}
      onHide={onHide}
      position='center'
      style={{width: '20vw'}}
      footer={footer}
    >
      <div className='flex flex-column gap-2 justify-content-center align-items-center'>
        <div>
          <label htmlFor='price' className='font-bold block mb-2'>
            Prix
          </label>
          <InputNumber
            value={multiPrice}
            onValueChange={(e) => setMultiPrice(e.value)}
            className='w-11'
            placeholder='Prix'
            useGrouping={false}
          />
        </div>
      </div>
    </Dialog>
  )
}

export default ChangeMultiPrix
