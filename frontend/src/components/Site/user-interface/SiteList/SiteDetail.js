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
    <div className='lt-page' data-testid="site-detail-page">
      <div className='lt-detail-header'>
        <div className='lt-detail-header-left'>
          <div className='lt-detail-avatar-ph' style={{background: '#FEF3C7', color: '#D97706'}}><i className='pi pi-map-marker'></i></div>
          <div className='lt-detail-info'>
            <h2 className='lt-detail-name'>Détail du site</h2>
          </div>
        </div>
      </div>
      <div className='lt-detail-tabs'>
        <TabView className='lt-tabview'>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-user'></i>Info client</span>}>
            <div className='lt-detail-form' style={{maxWidth: 500}}>
              <div className='lt-form-section'>
                <h4 className='lt-form-section-title'><i className='pi pi-building'></i>Customer Info</h4>
                <div className='lt-form-grid'>
                  <div className='lt-form-field lt-form-field--full'><FileUploadeComponent /></div>
                  <div className='lt-form-field'><label className='lt-form-label'>Client</label><InputText placeholder='Client' className='lt-form-input' /></div>
                  <div className='lt-form-field'><label className='lt-form-label'>Label</label><InputText placeholder='Label' className='lt-form-input' /></div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-map-marker'></i>Adresse</span>}>
            <div className='lt-detail-form' style={{maxWidth: 500}}>
              <div className='lt-form-section'>
                <h4 className='lt-form-section-title'><i className='pi pi-map'></i>Adresses</h4>
                <Card className='w-full' style={{borderRadius: 12, border: '1px solid var(--lt-border)'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8}}><i className='pi pi-map-marker' style={{color: '#3B82F6'}}></i><strong>Contact</strong></div>
                  <p style={{color: '#64748B', fontSize: '0.85rem', margin: 0}}>address.city / address.email / address.phone</p>
                </Card>
              </div>
            </div>
          </TabPanel>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-sitemap'></i>Sites</span>}>
            <SiteEditor />
            <SiteList titleShow={false} />
          </TabPanel>
          <TabPanel header={<span className='lt-tab-header'><i className='pi pi-tag'></i>Tags</span>}>
            <TagEditor />
            <TagList titleShow={false} />
          </TabPanel>
        </TabView>
      </div>
    </div>
  )
}

export default memo(SiteDetail)
