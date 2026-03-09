import 'bootstrap/dist/css/bootstrap.min.css'
import moment from 'moment'
import {Image} from 'primereact/image'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

const HeaderInvoice = ({img, creaDate, OrderDate, reference, ...props}) => {

  return (
    <div className='w-full bg-white border-gray-200 border-1 shadow-sm p-4 mt-2 rounded-3xl '>
      {/* Header Section */}
      <div className='relative  p-3'>
        <div className='flex justify-between items-start'>
          {/* Company Logo */}
          <div className='flex items-center pl-4'>
            {/* <span className='text-yellow-400 font-bold text-xl'>Z</span>
            <span className='text-lg font-semibold ml-2'>COMPANY</span> */}
            <Image
              src={require(`../../../../assets/images/Logitag Color.png`)}
              alt='logo'
              width='300'
              height='300'
            />
          </div>
          {/* Invoice Info */}
          <div
            className='relative text-white p-4 w-full max-w-lg 
            '
          >
            <div className='flex flex-col items-end'>
              <h1 className='text-gray-800 font-bold'>
                <OlangItem olang='LangInvoice' />
              </h1>
              <p className='text-base text-gray-400'>
                <OlangItem olang='LangRef' />:{' '}
                <span className='font-semibold text-gray-800 ml-2 text-xl'>{reference}</span>{' '}
              </p>
              <p className='text-base text-gray-400'>
                <OlangItem olang='LangDateOrder' />:{' '}
                <span className='font-semibold ml-2 text-gray-800 text-lg'>
                  {OrderDate
                    ? OrderDate
                    : moment(new Date(creaDate)) // Ensure it's a string
                        .add(Number(props?.jour) || 0, 'days')
                        .format('DD/MM/YYYY')}
                </span>{' '}
              </p>
              <p className='text-base text-gray-400'>
                <OlangItem olang='LangDateCreate' />:{' '}
                <span className='font-semibold text-gray-800 ml-2 text-lg'>
                  {typeof creaDate === 'string' ? creaDate : moment(creaDate).format('DD/MM/YYYY')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Invoice Details Section */}
      <div className='pl-8 mt-4 grid grid-cols-2 gap-8'>
        {/* Invoice To */}
        <div>
          <h1 className='text-gray-800 font-bold text-4xl'>
            <OlangItem olang='LangInvoiceTo' />
          </h1>
          <h4 className='text-lg font-bold'>{props?.Nom}</h4>
          {/* <p className='text-gray-600'>{props?.adresse}</p> */}
          <div className='flex flex-col mt-2 text-gray-700'>
            <p>
              <OlangItem olang='LangPhone' />:{' '}
              <span className='font-semibold text-lg'>{props?.Tel}</span>
            </p>
            <p>
              <OlangItem olang='LangEmail' />:{' '}
              <span className='font-semibold text-lg'>{props?.mail}</span>
            </p>
            <p>
              <OlangItem olang='LangAddress' />:{' '}
              <span className='font-semibold text-lg'>{props?.adresse}</span>
            </p>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h1 className='text-gray-800 font-bold text-4xl'>
            <OlangItem olang='Facture.B' />
          </h1>
          <div className='mt-2 space-y-1 text-gray-700'>
            <p>
              <OlangItem olang='LangBank' />:{' '}
              <span className='text-lg text-gray-800 font-semibold'>{props?.AccountNo}</span>
            </p>
            <p>
              <OlangItem olang='LangAccountName' />:{' '}
              <span className='text-lg text-gray-800 font-semibold'>{props?.AccountName}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderInvoice
