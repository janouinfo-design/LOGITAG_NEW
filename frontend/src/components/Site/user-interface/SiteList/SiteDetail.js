import {memo} from 'react'
import {TabView, TabPanel} from 'primereact/tabview'
import {InputText} from 'primereact/inputtext'
import {Card} from 'primereact/card'
import {Dropdown} from 'primereact/dropdown'
import SiteList from './SiteList'
import TagList from '../../../Tag/user-interface/TagList/TagList'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import TagEditor from '../../../Tag/user-interface/TagEditor/TagEditor'
import SiteEditor from '../SiteEditor/SiteEditor'
import {FileUploadeComponent} from '../../../shared/FileUploaderComponent/FileUploadeComponent'
import {OlangItem} from '../../../shared/Olang/user-interface/OlangItem/OlangItem'

const SiteDetail = () => {
  return (
    <>
      <div>
        <h3 className='bg-primary p-2 card'>
          <OlangItem olang='Detail WorkSite' style={{margin: '0 auto'}} />
        </h3>
      </div>
      <div className='w-full mt-4 flex align-items-center'>
        <TabView className='w-full'>
          <TabPanel header='Customer.info' leftIcon='pi pi-user mr-2'>
            <div
              className='flex flex-column mt-8 p-6 w-6'
              style={{
                boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
                borderRadius: '15px',
                height: '37rem',
              }}
            >
              <h3>Customer Info</h3>
              <div className='mt-7 flex flex-column'>
                <FileUploadeComponent />
                <InputText placeholder='Client' className='my-5' />
                <InputText placeholder='Label' />
                <ButtonComponent className={'mt-5 absolute left-50'}>Enregistrer</ButtonComponent>
              </div>
            </div>
          </TabPanel>
          <TabPanel header='Customer.address' leftIcon='pi pi-map-marker mr-2'>
            <div className='flex flex-column mt-6 p-6'>
              <h3>
                <i className='pi pi-map m-2 text-blue-500'></i>
                List
              </h3>
              <Card
                title='address.type'
                className='mt-5 p-3 w-5 '
                style={{boxShadow: 'rgba(0, 0, 0, 0.35) 0px 5px 15px'}}
              >
                <i className='pi pi-map-marker mb-3 text-blue-500'></i>
                <h4>Contact</h4>
                <h4>address.city</h4>
                <h4>address.email</h4>
                <h4>address.phone</h4>
              </Card>
            </div>
          </TabPanel>
          <TabPanel header='Customer.sites'>
            <SiteEditor />
            <SiteList titleShow={false} />
          </TabPanel>
          <TabPanel header='Customer.rentals' leftIcon='pi pi-search mr-2'>
            <Card title='Customer.rentals' className='mt-5 p-3 w-5'>
              <label>Site.List</label>
              <Dropdown className='w-5 ml-2' placeholder='Tous' />
            </Card>
          </TabPanel>
          <TabPanel header='Customer.tag'>
            <TagEditor />
            <TagList titleShow={false} />
          </TabPanel>
        </TabView>
      </div>
    </>
  )
}

export default memo(SiteDetail)
