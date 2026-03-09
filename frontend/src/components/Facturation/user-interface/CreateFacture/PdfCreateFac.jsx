import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import {DialogComponent} from '../../../shared/DialogComponent/DialogComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

const PdfCreateFac = ({visiblePdfCrt = false, onHidePdfCrt, onClickPdfCrt}) => {
  const headerPdf = (
    <strong>
      <OlangItem olang='gnrt.pdf' />
    </strong>
  )
  return (
    <DialogComponent visible={visiblePdfCrt} header={headerPdf} onHide={onHidePdfCrt}>
      <div className='d-flex justify-content-end gap-3 mt-2'>
        <ButtonComponent icon='pi pi-times' onClick={onHidePdfCrt}>
          <OlangItem olang='cancel' />
        </ButtonComponent>
        <ButtonComponent onClick={onClickPdfCrt} icon='pi pi-file-pdf' className='p-button-danger'>
          <OlangItem olang='generate.pdf' />
        </ButtonComponent>
      </div>
    </DialogComponent>
  )
}

export default PdfCreateFac
