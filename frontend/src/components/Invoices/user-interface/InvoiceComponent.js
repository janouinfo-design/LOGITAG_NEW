import {useLocation} from 'react-router-dom'
import {useAppDispatch, useAppSelector} from '../../../hooks'
import {getDetailInvoice, setDetailInvoice} from '../slice/invoice.slice'
import InvoiceDetail from './InvoiceDetails/InvoiceDetail'
import InvoiceEditor from './InvoiceEditor/InvoiceEditor'
import InvoiceList from './InvoiceList/InvoiceList'
import {useEffect} from 'react'

function InvoiceComponent() {
  const showDetail = useAppSelector(getDetailInvoice)
  const location = useLocation()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (location.pathname !== '/Invoice/index') {
      dispatch(setDetailInvoice(false))
    } else {
      dispatch(setDetailInvoice(true))
    }
  }, [dispatch, location.pathname])

  return (
    <div>
      {showDetail ? <InvoiceList /> : <InvoiceDetail />}
      <InvoiceEditor />
    </div>
  )
}

export default InvoiceComponent
