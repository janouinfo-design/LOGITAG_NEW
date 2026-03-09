import {Button} from 'primereact/button'
import {Carousel} from 'primereact/carousel'
import {_fetchAddressPsCore} from '../../../api'
import {useEffect} from 'react'

export default function AddressList() {
  let addresses = [
    {
      id: 1,

      contact: 'Emma Johnson',
      type: 'Facturation',
      city: 'Los Angeles',
      email: 'emma.johnson456@example.com',
      phone: '+1 (555) 123-4567',
    },

    {
      id: 2,
      contact: 'Michael Smith',
      type: 'Livraison',
      city: 'Chicago',
      email: 'michael.smith789@example.com',
      phone: '+1 (555) 987-6543',
    },

    {
      id: 3,
      contact: 'Sophia Anderson',
      type: 'Chargement',
      city: 'San Francisco',
      email: 'sophia.anderson123@example.com',
      phone: '+1 (555) 456-7890',
    },
  ]

  useEffect(() => {
    _fetchAddressPsCore()
      .then((res) => {
        console.table(res.data)
      })
      .catch((err) => {
        console.log(err)
      })
  }, [])

  return (
    <>
      <h3 className='bg-primary p-2 card text-center'>Adresses</h3>

      <div className='grid p-5'>
        {addresses.map((address) => (
          <div className='col-12 md:col-6 lg:col-4'>
            <h4 className='bg-dark text-center text-white py-2'>{address.type}</h4>
            <div>
              Contact: <h6 className='mb-1'>{address.contact}</h6>
              City: <h6 className='mb-1'>{address.city}</h6>
              Email: <h6 className='mb-1'>{address.email}</h6>
              Phone: <h6 className='mb-1'>{address.phone}</h6>
            </div>
            <div className='text-right'>
              <Button icon='pi pi-pencil' size='small' />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
