import {getCardSelected, getEditDashboard, getSelectedMode} from '../slice/dashboard.slice'
import {useAppSelector} from '../../../hooks'
import DashboardList from './DashboardList/DashboardList'
import DashboardDetail from './DashboardDetail/DashboardDetail'
import DashboardListCards from './DashboardCards/DashboardListCards'
import DashboardTable from './DashboardTable/DashboardTable'

const DashboardComponent = () => {
  const isEdit = useAppSelector(getEditDashboard)
  const selectedCard = useAppSelector(getCardSelected)
  const selectedMod = useAppSelector(getSelectedMode)

  return (
    <div
      data-testid="dashboard-component"
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        padding: '16px',
        minHeight: 'calc(100vh - 100px)',
        background: '#F8FAFC',
        borderRadius: '16px',
      }}
    >
      {selectedMod === 'card' ? <DashboardListCards /> : !isEdit && <DashboardList />}
      {isEdit && <DashboardDetail />}
      {selectedCard != null ? <DashboardTable /> : null}
    </div>
  )
}

export default DashboardComponent
