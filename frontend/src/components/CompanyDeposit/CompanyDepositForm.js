import {InputText} from 'primereact/inputtext'
import {OlangItem} from '../shared/Olang/user-interface/OlangItem/OlangItem'
import ButtonComponent from '../shared/ButtonComponent/ButtonComponent'
import { TabPanel, TabView } from 'primereact/tabview'
import { useAppSelector } from '../../hooks'
import { getSelectedCompanyDeposite, setselectedCompanyDeposite } from './slice/companyDeposit.slice'
import { useDispatch } from 'react-redux'
import _ from 'lodash'

const CompanyDepositForm = () => {
    const dispatch = useDispatch()
    const selectedCompanyDeposite = useAppSelector(getSelectedCompanyDeposite)
    

  const onInputChange = (e) => {
    let old = _.cloneDeep(selectedCompanyDeposite)
    old = {
      ...old,
      [e.target.name]: e.target.value,
    }
    dispatch(setselectedCompanyDeposite(old))
    // const areAllRequiredFieldsFilled = validators
    //   .filter((validator) => validator.isRequired)
    //   .every((validator) => !!old[validator.id])
    //setIsValid(!areAllRequiredFieldsFilled)
  }
  const save = () => {
  }
  return (
    <>
      <TabView>
        <TabPanel header={<OlangItem olang='Info' />}>
          <div
            className='flex mt-10 flex-column lg:w-full xl:w-6 '
            style={{
              boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
              borderRadius: '15px',
            }}
          >
            <section className='w-12 p-2 ml-8 mt-4'>
              <div className=' my-3 flex flex-column'>
                <label className='my-2 ml-1'>
                  <OlangItem olang='Name' />
                </label>
                <InputText name='Name' className='w-10 font-semibold text-lg' onChange={onInputChange} />
              </div>
              <div className=' my-3 flex flex-column'>
                <label className='my-2 ml-1'>
                  <OlangItem olang='Label' />
                </label>
                <InputText name='Label' className='w-10 font-semibold text-lg' onChange={onInputChange} />
              </div>
              <div className=' my-3 flex flex-column'>
                <label className='my-2 ml-1'>
                  <OlangItem olang='Company' />
                </label>
                <InputText name='Company' className='w-10 font-semibold text-lg' onChange={onInputChange} />
              </div>
              <div className=' my-3 flex flex-column'>
                <label className='my-2 ml-1'>
                  <OlangItem olang='IDE' />
                </label>
                <InputText name='IDE' className='w-10 font-semibold text-lg' onChange={onInputChange} />
              </div>
              <div className='flex justify-content-end w-10 mt-6 my-5'>
                <ButtonComponent onClick={save} className='w-10rem flex justify-content-center'>
                  <OlangItem olang='Save' />
                </ButtonComponent>
              </div>
            </section>
          </div>
        </TabPanel>
      </TabView>
    </>
  )
}

export default CompanyDepositForm
