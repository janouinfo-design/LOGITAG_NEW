import React from 'react'
import {TabView, TabPanel} from 'primereact/tabview'
import CustomerInfo from './CustomerDetails/CustomerInfo'
import WorkSiteList from '../../../WorkSite/WorkSiteList'
import AddressList from '../../../Address/AddressList/AddressList'

function CustomerProfileEditor() {
  return (
    <div className='card'>
      <TabView>
        <TabPanel header='Customer.info'>
          <div className='w-6'>
            <CustomerInfo />
          </div>
        </TabPanel>
        <TabPanel header='Customer.address'>
          {/* Here should be the CustomerAddress component */}
          <AddressList />
        </TabPanel>
        <TabPanel header='Customer.sites'>
          <WorkSiteList />
        </TabPanel>
        <TabPanel header='Customer.rentals'>
          {/* Here should be the CustomerRentals component */}
        </TabPanel>
      </TabView>
    </div>
  )
}

export default CustomerProfileEditor
