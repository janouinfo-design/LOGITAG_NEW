import {useAppSelector} from '../../../hooks'
import {getDetailInvoice} from '../slice/invoice.slice'
import InvoiceDetail from './InvoiceDetails/InvoiceDetail'
import InvoiceEditor from './InvoiceEditor/InvoiceEditor'
import InvoiceList from './InvoiceList/InvoiceList'

function InvoiceComponent() {
  const showDetail = useAppSelector(getDetailInvoice)

  return (
    <div>
      {showDetail ? <InvoiceList /> : <InvoiceDetail />}
      <InvoiceEditor />
    </div>
  )
}

export default InvoiceComponent
