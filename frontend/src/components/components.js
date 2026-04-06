import AlertComponent from './Alert/ui/AlertComponent'
import AddressDetail from './Company/user-interface/AddressDetail/AddressDetail'
import CompanyComponent from './Company/user-interface/Company.component'
import CompanyDepositForm from './CompanyDeposit/CompanyDepositForm'
import CustomerComponent from './Customer/CustomerComponent'
import ClientDetail from './Customer/CustomerList/ClientDetail'
import PremiumDashboard from './premium/PremiumDashboard'
import PremiumAssets from './premium/PremiumAssets'
import PremiumMap from './premium/PremiumMap'
import PremiumActivity from './premium/PremiumActivity'
import PremiumAlerts from './premium/PremiumAlerts'
import PremiumZones from './premium/PremiumZones'
import PremiumUsers from './premium/PremiumUsers'
import PremiumSettings from './premium/PremiumSettings'
import PremiumReports from './premium/PremiumReports'
import PremiumGateway from './premium/PremiumGateway'
import PremiumAssetDetail from './premium/PremiumAssetDetail'
import PremiumPlanning from './premium/PremiumPlanning'
import PremiumReservationPlanning from './premium/PremiumReservationPlanning'
import PremiumMyReservations from './premium/PremiumMyReservations'
import PremiumReservationDashboard from './premium/PremiumReservationDashboard'
import PremiumRoles from './premium/PremiumRoles'
import EnterpriseCommand from './premium/EnterpriseCommand'
import DashboardNewComponent from './DashboardNew/user-interface/DashboardNewComponent'
import CustomerDashboard from './DashboardNew/user-interface/dashboard/CustomerDashboard'
import DashboardTest from './DashboardNew/user-interface/dashboard/DadhboardTest'
import DataInsertion from './DataInsertion/user-interface/DataInsertion'
import EnginDetail from './Engin/EnginDetail/EnginDetail'
import MapComponent from './Engin/EnginDetail/MapComponent'
import EnginInactive from './Engin/EnginList/EnginInactive'
import EngineComponent from './Engin/EngineComponent'
import PotentialDeliveredEngins from './Engin/PotentialDelivered/PotentialDelivered'
import ArchivedComponentCl from './Facturation/user-interface/Clients/ArchivedClient/ArchivedComponentCl'
import ClientAfacturer from './Facturation/user-interface/Clients/ClientAfacturer'
// import ElementFacturable from './Facturation/user-interface/ElementFacturable'
// import ElementFacture from './Facturation/user-interface/ElementFacture'
import Facturation from './Facturation/user-interface/Facturation'
import FacturePermanente from './Facturation/user-interface/FacturePermanente/FacturePermanente'
import FacturationList from './Facturation/user-interface/ValidationFacClient/FacturationList'
import ValidationFacComponent from './Facturation/user-interface/ValidationFacClient/ValidationFacComponent'
import ArchivedFrComponent from './FacturationFornisseur/user-interface/ArchivedFornisseur/ArchivedFrComponent'
import FornesseurAFacurer from './FacturationFornisseur/user-interface/FornesseurAFacurer/FornesseurAFacurer'
import FacValidComponent from './FacturationFornisseur/user-interface/FornisseurValidationFac/FacValidComponent'
import FactureComponentFr from './FacturationFornisseur/user-interface/ListFactureFr/FactureComponentFr'
import FactureComponent from './FacturesList/user-interface/FactureComponent'
// import FacturationList from './Facturation/user-interface/FacturationList'
import FamillesComponent from './Famillies/user-interface/FamillesComponent'
import {GatewayComponent} from './Gateway/ui/GatewayComponent'
import {GatewayList} from './Gateway/ui/GatewayList/GatewayList'
import GatewayRoutes from './Gateway/ui/GatewayRoutes'
import GeofencingComponent from './Geofencing/GeofencingComponent'
import InventoryComponent from './Inventory/InventoryComponent'
import InventoryList from './Inventory/InventoryList'
import InvoiceComponent from './Invoices/user-interface/InvoiceComponent'
import InvoiceDetail from './Invoices/user-interface/InvoiceDetails/InvoiceDetail'
import RFLocationTag from './LocationTag/user-interface/RFLocationTag'
import LogsTrackingList from './LogsTracking/user-interface/LogsTrackingList'
import MapTest from './MapTest'
import CalendarView from './Planning/CalendarView/user-interface/CalendarView'
import PlanningComponent from './Planning/PlanningComponent'
import QrCodeApk from './QrCodeApk/user-interface/QrCodeApk'
import RFEngineComponent from './RFEngine/user-interface/RFEngineComponent'
import RfTag from './RFTag/user-interface/RFTagComponent'
import NewRapportUser from './Repports/user-interface/NewRapport/NewRapportUser'
import NewRepportComponent from './Repports/user-interface/NewRepportComponent'
import RapportComponent from './Repports/user-interface/RapportComponent'
import RapportDisplayed from './Repports/user-interface/RapportDisplayed'
import SetupInfo from './Setup_Info/user-interface/Setup.info'
import SiteComponent from './Site/user-interface/SiteComponent'
import SiteDetail from './Site/user-interface/SiteList/SiteDetail'
import StatusComponent from './Status/user-interface/StatusComponent'
import StatutComponent from './Statut/user-interface/StatutComponent'
import TagComponent from './Tag/user-interface/TagComponent'
import TagDetail from './Tag/user-interface/TagDetail/TagDetail'
import TagMapViewComponent from './TagMapView/user-interface/TagMapViewComponent'
import TeamComponent from './Teams/user-interface/TeamComponent'
import VehicleMapView from './Vehicle/user-interface/VehicleMapView'
import ReservationVehComponent from './VehicleReservation/user-interface/ReservationVehComponent'
import VehiculesComponent from './Vehicules/user-interface/VehiculesComponent'
import DepotComponent from './depot/user-interface/DepotComponent'
import VehComponent from './veh/vehComponent'
import VehList from './veh/vehList'
// import WorkSiteList from "./WorkSite/WorkSiteList"
// test2
const components = {
  /** dadev */
  geofencing: GeofencingComponent,

  /** zakaria */
  'view/engin/index': PremiumAssets,
  'tag/index': TagComponent,
  'customer/index': CustomerComponent,
  'view/staff/index': PremiumUsers,
  'worksite/index': SiteComponent,
  'Invoice/index': InvoiceComponent,
  'tour/index': PremiumMap,
  'tag/detail': TagDetail,
  'Company/index': CompanyComponent,
  'menu/setup': PremiumSettings,
  'Geofence/index': PremiumZones,
  // 'facture/index': QrCodeApk,
  'facture/fournisseur': Facturation,
  'facture/client': FacturationList,
  'statutactuelrftag/index': RfTag,
  'sommairerftags/index': RFEngineComponent,
  'equipmentInventory/index': RFLocationTag,
  // "equipmentInventory/index": DashboardTest,
  'timeline/index': PremiumPlanning,
  'Status/index': StatusComponent,
  'tagdashboard/index': PremiumDashboard,
  'famille/index': FamillesComponent,
  // 'situationtags/index': RfTag,
  'vehicule/index': VehList,
  'inventory/index': InventoryComponent,
  'vehicule/index': VehComponent,
  'deposit/index': DepotComponent,
  'rapports/index': RapportComponent,
  'EnginNoActive/index': EnginInactive,
  'asset/detail': PremiumAssetDetail,
  'LOGS/index': PremiumActivity,
  'gateway/index': PremiumGateway,
  // 'rapport/index': NewRapportUser,
  // 'rapport/index': NewRepportComponent,
  'rapport/index': PremiumReports,
  'qrcodeapk/index': QrCodeApk,
  'datainsertion/index': DataInsertion,
  'places/reservationvehicule': ReservationVehComponent,
  'newdashboard/index': DashboardNewComponent,
  'facture/clientAfacturer': ClientAfacturer,
  'facture/clientFacturer': FactureComponent,
  'facture/FacturesPermanentesClient': FacturePermanente,
  'facture/FactureArchiverClient': ArchivedComponentCl,
  'facture/clientValidation': ValidationFacComponent,
  'facture/fournisseurAfacturer': FornesseurAFacurer,
  'facture/fournisseurFacturer': FactureComponentFr,
  'facture/FacturesPermanentesFournisseur': FacturePermanente,
  'facture/FactureArchiverFournisseur': ArchivedFrComponent,
  'facture/fournisseurValidation': FacValidComponent,
  'dashboard/newdashboard': DashboardNewComponent,
  'engins/potentialdelivered': PotentialDeliveredEngins,
  'situationtags/index': DashboardNewComponent,
  'dashboard/customer': CustomerDashboard,
  'alert/index': PremiumAlerts,
  'reservation/planning': PremiumReservationPlanning,
  'reservation/myreservations': PremiumMyReservations,
  'reservation/dashboard': PremiumReservationDashboard,
  'admin/roles': PremiumRoles,
  'command/center': EnterpriseCommand,

  // 'rapport/index': MapTest,

  /** Rabi */
}

export default components
