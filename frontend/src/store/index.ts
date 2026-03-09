import {configureStore} from '@reduxjs/toolkit'
import customerSlice from './slices/customer.slice'
import geofencingSlice from './slices/geofencing.slice'
import userSlice from '../components/User/slice/user.slice'
import providerSlice from './slices/provider.slice'
import depositSlice from './slices/deposit.slice'
import olangSlice from '../components/shared/Olang/slice/olang.slice'
import alertSlice from './slices/alert.slice'
import vehicleSlice from '../components/Vehicle/slice/vehicle.slice'

import planingSlice from '../components/Planning/slice/planing.slice'
import tagSlice from '../components/Tag/slice/tag.slice'
import invoiceSlice from '../components/Invoices/slice/invoice.slice'
import engineSlice from '../components/Engin/slice/engin.slice'
import siteSlice from '../components/Site/slice/site.slice'
import teamSlice from '../components/Teams/slice/team.slice'

import layoutSlice from '../components/Layout/slice/layout.slice'
import companySlice from '../components/Company/slice/company.slice'
import factureSlice from '../components/Facturation/slice/facture.slice'
import navixySlice from '../components/Navigxy/slice/navixy.slice'
import facturationSlice from '../components/Facturation/slice/facturation.slice'
import elementFacturableSlice from '../components/Facturation/slice/elementFacturable.slice'
import rfTagSlice from '../components/RFTag/slice/rftag.slice'
import rfEngineSlice from '../components/RFEngine/slice/rfEngine.slice'
import locationTagSlice from '../components/LocationTag/slice/locationTag.slice'
import setupInfoSlice from '../components/Setup_Info/Slice/setupInfo.slice'
import dashboardSlice from '../components/Dashboard/slice/dashboard.slice'
import statusSlice from '../components/Status/slice/status.slice'
import NavixySlice from '../components/shared/MapComponent/slice/navixy.slice'
import GeofencingSlice from '../components/shared/MapComponent/slice/geofencing.slice'

import confirmDialogSlice from './slices/confirmDialog.slice'
import addressSiteSlice from '../components/Site/slice/addressSite.slice'
import familleSlice from '../components/Famillies/slice/famille.slice'

import ChatSlice from '../_metronic/partials/layout/drawer-messenger/slice/Chat.slice'
import vehSlice from '../components/veh/slice/veh.slice'
import inventorySlice from '../components/Inventory/slice/inventory.slice'
import statutSlice from '../components/Statut/slice/statut.slice'
import companyDepositSlice from '../components/CompanyDeposit/slice/companyDeposit.slice'
import uiSlice from './slices/ui.slice'
import depotSlice from '../components/depot/slice/depot.slice'
import addressDepotSlice from '../components/depot/slice/addressDepot.slice'
import rapportsSlice from '../components/Repports/slice/rapports.slice'
import logsSlice from '../components/LogsTracking/slice/logs.slice'
import gatewaySlice from '../components/Gateway/slice/gateway.slice'
import dataInsertionSlice from '../components/DataInsertion/slice/dataInsertion.slice'
import factureListSlice from '../components/FacturesList/slice/factureListSlice'
import factureFornisseurSlice from '../components/FacturationFornisseur/slice/factureFornisseur.slice'
// import alert2Slice from '../components/Alert/slice/slice'

const store = configureStore({
  reducer: {
    ui: uiSlice,
    customers: customerSlice,
    geofencing: geofencingSlice,
    user: userSlice,
    provider: providerSlice,
    //deposit: depositSlice,
    olang: olangSlice,
    alert: alertSlice,
    vehicle: vehicleSlice,
    planning: planingSlice,
    tag: tagSlice,
    invoice: invoiceSlice,
    engine: engineSlice,
    selectCustomer: customerSlice,
    site: siteSlice,
    team: teamSlice,
    company: companySlice,
    layout: layoutSlice,
    facture: factureSlice,
    navixy: navixySlice,
    facturation: facturationSlice,
    elementFacturable: elementFacturableSlice,
    rfTag: rfTagSlice,
    rfEngine: rfEngineSlice,
    locationTag: locationTagSlice,
    setupInfo: setupInfoSlice,
    dashboard: dashboardSlice,
    status: statusSlice,
    confirmDialog: confirmDialogSlice,
    addressSite: addressSiteSlice,
    addressDepot: addressDepotSlice,
    //addressDeposit: addressDepositSlice,
    Navixy: NavixySlice,
    Geofence: GeofencingSlice,
    famille: familleSlice,
    chat: ChatSlice,
    vehicules: vehSlice,
    inventory: inventorySlice,
    statut: statutSlice,
    companyDeposite: companyDepositSlice,
    depot: depotSlice,
    rapport: rapportsSlice,
    logs: logsSlice,
    gateway: gatewaySlice,
    dataInsertion: dataInsertionSlice,
    factureList: factureListSlice,
    factureFornisseur: factureFornisseurSlice,
    // alerts: alert2Slice,
  },
})

//test

export default store

export type RootState = typeof store.getState
export type AppDispatch = typeof store.dispatch
