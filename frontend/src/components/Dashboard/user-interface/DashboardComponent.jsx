import {getCardSelected, getEditDashboard, getSelectedMode} from '../slice/dashboard.slice'
import {useAppSelector} from '../../../hooks'
import DashboardList from './DashboardList/DashboardList'
import DashboardDetail from './DashboardDetail/DashboardDetail'
import DashboardListCards from './DashboardCards/DashboardListCards'
import DashboardTable from './DashboardTable/DashboardTable'
import DashboardCharts from './DashboardCharts/DashboardCharts'

const DashboardComponent = () => {
  const isEdit = useAppSelector(getEditDashboard)
  const selectedCard = useAppSelector(getCardSelected)
  const selectedMod = useAppSelector(getSelectedMode)

  return (
    <div className='bg-gray-100 flex flex-1 flex-column justify-content-center align-items-center p-2'>
      {selectedMod === 'card' ? <DashboardListCards /> : !isEdit && <DashboardList />}
      {isEdit && <DashboardDetail />}
      {selectedCard != null ? <DashboardTable /> : null}
      {/* <DashboardCharts /> */}
    </div>
  )
}

export default DashboardComponent
