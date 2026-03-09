import {Dialog} from 'primereact/dialog'
import CalculatorPopup from '../../../Facturation/user-interface/components/CalculatorPopup'

const CalculeDialog = ({visible, onHide, saveCalcBtn, loadingSave, placeholder}) => {
  return (
    <Dialog onHide={onHide} header='Header' visible={visible} style={{width: '50vw'}} modal={true}>
      <CalculatorPopup
        placeholder={placeholder}
        loadingSave={loadingSave}
        saveCalcBtn={saveCalcBtn}
        type={'condition'}
      />
    </Dialog>
  )
}

export default CalculeDialog
