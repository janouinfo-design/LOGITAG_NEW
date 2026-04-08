// import { InputText } from 'primereact/inputtext';
// import { InputTextarea } from 'primereact/inputtextarea';
// import { Checkbox } from 'primereact/checkbox';
// import React, { useEffect, useState } from 'react';
// import { Dropdown } from 'primereact/dropdown';
// import CalculatorPopup from './components/CalculatorPopup';
// import { DialogComponent } from '../../shared/DialogComponent';
// import { useAppDispatch, useAppSelector } from '../../../hooks';
// import {
//   createOrUpdateTarif,
//   fetchEtat,
//   fetchMatrices,
//   fetchNiveauSrcData,
//   fetchParamsNiveau,
//   fetchPrestation,
//   getDataTarif,
//   getEtatList,
//   getFormuleCalcul,
//   getFormuleCondition,
//   getLoadingTar,
//   getMatrices,
//   getNiveauSrcData,
//   getParamsNiveau,
//   getPrestationList,
//   getSelectedEtat,
//   getSelectedPrestation,
//   getSelectedSrcData,
//   getSelectedTarif,
//   getVisibleCalcul,
//   setDataTarif,
//   setFormuleCalcul,
//   setFormuleCondition,
//   setLoadingTar,
//   setSelectedEtat,
//   setSelectedPrestation,
//   setSelectedSrcData,
//   setVisibleCalcul,
//   setVisibleNew,
// } from '../slice/facturation.slice';
// import DialogContent from './DialogContent';
// import ButtonComponent from '../../shared/ButtonComponent';
// import {
//   ColumnsPrestation,
//   ColumnsNiveauSrcDataDossier,
//   ColumnsNiveauSrcDataClient,
//   ColumnsEtat,
// } from './columns';
// import _ from 'lodash';
// import { Button } from 'primereact/button';
// import { useSelector } from 'react-redux';
// import { OlangItem } from '../../shared/Olang/user-interface/OlangItem/OlangItem';
// import { getCustomers } from '../../../store/slices/customer.slice';
// import { useFormik } from 'formik';

// const NewTarif = () => {
//   const [checkedNiveau, setCheckedNiveau] = useState(false);
//   const [checkedFormule, setCheckedFormule] = useState(false);
//   const [selectedApplication, setSelectedApplication] = useState(null);
//   const [visibleSrcData, setVisibleSrcData] = useState(false);
//   const [visiblePrestation, setVisiblePrestation] = useState(false);
//   const [visibleEtat, setVisibleEtat] = useState(false);
//   const [prestationChange, setPrestationChange] = useState(null);
//   const [etatChange, setEtatChange] = useState(null);
//   const [srcDataChange, setSrcDataChange] = useState(null);
//   const [typeFormule, setTypeFormule] = useState(null);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [showClient, setShowClient] = useState(false);
//   const applications = ['Dossier', 'Client'];
//   const dispatch = useAppDispatch();
//   let selectedPrestation = useAppSelector(getSelectedPrestation);
//   let selectedEtat = useAppSelector(getSelectedEtat);
//   let selectedSrcData = useAppSelector(getSelectedSrcData);
//   let ParamsNiveau = useAppSelector(getParamsNiveau);
//   let PrestationList = useAppSelector(getPrestationList);
//   let EtatList = useAppSelector(getEtatList);
//   let formuleCondition = useAppSelector(getFormuleCondition);
//   let formuleCalcul = useAppSelector(getFormuleCalcul);
//   let visibleCalcul = useAppSelector(getVisibleCalcul);
//   let NiveauSrcData = useAppSelector(getNiveauSrcData);
//   const dataTarif = useAppSelector(getDataTarif);
//   const loadingTar = useAppSelector(getLoadingTar);
//   const customers = useAppSelector(getCustomers);
//   const tarif = useAppSelector(getSelectedTarif);

//   const formik = useFormik({
//     initialValues: {
//       code: '',
//       description: '',
//       client: '',
//       prestation: '',
//       etat: '',
//       id_tarif_filter_selection: '',
//       formule_condition: '',
//       formule_calcule: '',
//       valeur_filter_selection: '',
//     },
//     onSubmit: (values) => {
//       let data = {
//         ...values,
//         customerId: values?.client || '',
//       };
//       handleSaveTarif(data);
//     },
//   });

//   const hideCalcul = () => {
//     dispatch(setVisibleCalcul(false));
//   };

//   const handleSelection = (selectedInv) => {
//     setSrcDataChange(selectedInv);
//   };

//   const handleSelectionPrestation = (selectedPrestation) => {
//     setPrestationChange(selectedPrestation);
//   };

//   const saveFormule = (formuleCondition, field) => {
//     formik.setFieldValue(field, formuleCondition);
//   };

//   const handleSelectionEtat = (selectedEtat) => {
//     setEtatChange(selectedEtat);
//   };

//   const savePrestation = () => {
//     dispatch(setSelectedPrestation(prestationChange));
//     formik.setFieldValue('prestation', prestationChange.Produit);
//     setVisiblePrestation(false);
//   };

//   const saveEtat = () => {
//     formik.setFieldValue('etat', etatChange.Etat);
//     dispatch(setSelectedEtat(etatChange));
//     setVisibleEtat(false);
//   };

//   const saveSrcData = () => {
//     formik.setFieldValue('valeur_filter_selection', srcDataChange?.OTID);
//     dispatch(setSelectedSrcData(srcDataChange));
//     dispatch(setVisibleSrcData(false));
//   };

//   const handleClickCalc = (type) => {
//     setTypeFormule(type);
//     dispatch(setVisibleCalcul(true));
//   };

//   const onInputChange = (e) => {
//     let old = _.cloneDeep(dataTarif);
//     old = { ...old, [e.target.name]: e.target.value };
//     dispatch(setDataTarif(old));
//   };

//   const showCl = (e) => {
//     if (!e.checked) {
//       formik.setFieldValue('client', '');
//       setSelectedCustomer(null);
//     }
//     setShowClient(e.checked);
//   };

//   const handleSaveTarif = (data) => {
//     dispatch(setLoadingTar(true));
//     dispatch(createOrUpdateTarif(data)).then((res) => {
//       if (res.payload) {
//         dispatch(setVisibleNew(false));
//         dispatch(setDataTarif(null));
//         dispatch(setLoadingTar(false));
//       }
//     });
//   };

//   const getValApplication = async (id) => {
//     if (!Array.isArray(ParamsNiveau)) return;
//     const findName = ParamsNiveau.find((item) => item.id == id);
//     await dispatch(fetchNiveauSrcData(findName?.Code));
//     setVisibleSrcData(true);
//   };

//   const footerSave = (handleSave) => (
//     <div className='flex justify-content-end'>
//       <Button
//         label='Enregistrer'
//         icon='pi pi-check'
//         onClick={handleSave}
//         className='p-button-success mr-2'
//       />
//     </div>
//   );

//   useEffect(() => {
//     Promise.all([dispatch(fetchParamsNiveau()), dispatch(fetchPrestation()), dispatch(fetchEtat())])
//       .then(() => {
//         if (tarif?.id_tarif_filter_selection) {
//           setCheckedNiveau(true);
//         }
//         if (tarif?.formule_condition) {
//           setCheckedFormule(true);
//         }
//         if (tarif && Object.keys(tarif).length !== 0) {
//           formik.setValues(tarif);
//         }
//       })
//       .catch((error) => {
//         console.error('Error in requests:', error);
//       });
//   }, []);

//   return (
//     <div className='flex flex-column align-items-center w-full bg-gradient-to-r from-blue-200 to-purple-200 p-6'>
//       <div className='shadow-md rounded-lg p-5 bg-white w-full'>
//         <h2 className='text-2xl font-semibold text-center mb-10'>Tarif</h2>
//         <div className='mb-4 justify-between'>
//           <div class="flex gap-x-6 mb-6">
//             <div className='mb-4 w-full relative mx-5'>
//               <label class="block text-gray-700 text-sm font-bold mb-2" for="code">
//                 Code
//               </label>
//               <InputText
//                 name='code'
//                 className='block w-full h-4rem text-2xl text-bold px-5 py-2.5 bg-white leading-7 text-base font-normal shadow-xs text-gray-900 bg-transparent borderborder-gray-600 rounded-full placeholder-gray-400 focus:outline-none'
//                 required
//                 id="code"
//                 onChange={formik.handleChange}
//                 value={formik.values.code}
//                 disabled={tarif?.id_tarif || false}
//               />
//             </div>
//             <div className='w-full relative mx-5'>
//               <label className='block mb-2 font-medium' for="description">Description</label>
//               <textarea
//                 rows={1}
//                 name='description'
//                 value={formik.values.description}
//                 required
//                 className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
//                 onChange={formik.handleChange}
//               />
//             </div>
//           </div>
//           <div className='mt-4 items-baseline justify-between'>


//             <div className='flex flex gap-x-6 mb-6 mx-4'>
//               <div className='flex mb-4 w-full relative items-baseline gap-x-3'>
//                 <Checkbox onChange={(e) => showCl(e)} checked={showClient} id='checkbox' className='mx-2' />
//                 <label className='block mb-2 font-medium' for="checkbox">Selectionner un  Client</label>
//               </div>



//               <div className='mb-4 w-full relative'>
//                 <Dropdown
//                   name='client'
//                   label="Select Version"
//                   placeholder='Selectionner un client'
//                   className='h-3rem borderborder-gray-600 rounded-md w-full ml-2'
//                   value={formik.values.client}
//                   filter
//                   disabled={!showClient}
//                   optionValue='ClientID'
//                   optionLabel='Nom'
//                   options={customers}
//                   onChange={formik.handleChange}
//                 />

//               </div>




//             </div>
//           </div>
//         </div>
//         <div className='grid grid-cols-1 gap-4 mt-4'>
//           <div className='flex flex-col'>
//             <div className='mb-4 w-full relative mx-5'>
//               <label className='block text-gray-700 text-sm font-bold mb-2' for='prestation'>Prestation</label>
//               <div className='flex items-center gap-x-2'>
//                 <InputText
//                   name='prestation'
//                   id="prestation"
//                   value={formik.values.prestation}
//                   className='shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
//                   required
//                 />
//                 <ButtonComponent
//                   icon='pi pi-pencil'
//                   className='h-2.5rem w-2.5rem mx-2 mt-1'
//                   onClick={() => setVisiblePrestation(true)}
//                 />
//                 <DialogComponent
//                   header='Selected Item'
//                   visible={visiblePrestation}
//                   footer={() => footerSave(savePrestation)}
//                   onHide={() => setVisiblePrestation(false)}
//                   className='md:w-7 md:h-auto right-0'
//                   position='bottom'
//                 >
//                   <DialogContent
//                     tableId='table_prestation'
//                     columns={ColumnsPrestation}
//                     data={PrestationList}
//                     onSelections={handleSelectionPrestation}
//                     selectionMode='single'
//                     onAddButtonClick={savePrestation}
//                     isDataSelectable={true}
//                     selectionRowsProps={true}
//                     selectedRow={selectedPrestation}
//                   />
//                 </DialogComponent>
//               </div>
//             </div>

//             <div className='mb-4 w-full relative mx-5'>
//               <label className='block text-gray-700 text-sm font-bold mb-2' for='etat'>Etat</label>
//               <div className='flex items-center gap-x-2'>
//                 <InputText
//                   name='etat'
//                   value={formik.values.etat}

//                   className='shadow appearance-none border rounded w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
//                   required
//                 />
//                 <ButtonComponent
//                   icon='pi pi-pencil'
//                   className='h-2.5rem w-2.5rem mx-2 mt-1'
//                   onClick={() => setVisibleEtat(true)}
//                 />
//                 <DialogComponent
//                   header='Selected Item'
//                   visible={visibleEtat}
//                   footer={() => footerSave(saveEtat)}
//                   onHide={() => setVisibleEtat(false)}
//                   className='md:w-7 right-0'
//                   position='right-20'
//                 >
//                   <DialogContent
//                     tableId='table etat'
//                     columns={ColumnsEtat}
//                     data={EtatList}
//                     onSelections={handleSelectionEtat}
//                     selectionMode='single'
//                     onAddButtonClick={saveEtat}
//                     isDataSelectable={true}
//                     selectionRowsProps={true}
//                     selectedRow={selectedEtat}
//                   />
//                 </DialogComponent>
//               </div>
//             </div>

//           </div>
//         </div>
//       </div>
//       <div className='shadow-md rounded-lg p-5 bg-white w-full mt-4'>
//         <h2 className='text-2xl font-semibold mb-4'>Niveau d'application</h2>
//         <div className='flex items-center mb-4'>
//           <p className='text-lg mr-2'>Niveau:</p>
//           <Checkbox
//             className='mt-1'
//             onChange={(e) => setCheckedNiveau(e.checked)}
//             checked={checkedNiveau}
//           />
//         </div>
//         <div className='grid grid-cols-1 gap-4'>
//           <div className='flex flex-col'>
//             <label className='block mb-2 font-medium'>Champs</label>
//             <Dropdown
//               options={ParamsNiveau}
//               placeholder='Sélectionner'
//               name='id_tarif_filter_selection'
//               optionLabel='Code'
//               optionValue='id'
//               value={formik.values.id_tarif_filter_selection}
//               disabled={!checkedNiveau}
//               className='h-3rem borderborder-gray-600 rounded-md'
//               onChange={formik.handleChange}
//             />
//           </div>
//           <div className='flex flex-col mt-4'>
//             <label className='block mb-2 font-medium'>Valeur</label>
//             <InputText
//               name='valeur'
//               className='p-2 borderborder-gray-600 rounded-md'
//               value={formik.values.valeur_filter_selection}
//               disabled={!formik.values.id_tarif_filter_selection || !checkedNiveau}
//             />
//             <div className='mt-2'>
//               <ButtonComponent
//                 icon='pi pi-pencil'
//                 className='h-2rem w-2rem'
//                 onClick={() => getValApplication(formik.values.id_tarif_filter_selection)}
//                 disabled={!formik.values.id_tarif_filter_selection || !checkedNiveau}
//               />
//             </div>
//           </div>
//         </div>
//         <DialogComponent
//           header='Selected Item'
//           visible={visibleSrcData}
//           footer={() => footerSave(saveSrcData)}
//           onHide={() => setVisibleSrcData(false)}
//           className='md:w-7 right-0'
//           position='bottom-right'
//         >
//           <DialogContent
//             tableId='table SrcData'
//             columns={
//               formik.values.id_tarif_filter_selection == 1
//                 ? ColumnsNiveauSrcDataDossier
//                 : ColumnsNiveauSrcDataClient
//             }
//             data={NiveauSrcData}
//             onSelections={handleSelection}
//             selectionMode='single'
//             addBtn={false}
//             isDataSelectable={true}
//             selectionRowsProps={true}
//             selectedRow={srcDataChange}
//           />
//         </DialogComponent>
//       </div>
//       <div className='shadow-md rounded-lg p-5 bg-white w-full mt-4'>
//         <h2 className='text-2xl font-semibold mb-4'>Formule Condition</h2>
//         <div className='flex items-center justify-between mb-4'>
//           <Checkbox
//             className='mt-1'
//             onChange={(e) => {
//               setCheckedFormule(e.checked);
//               if (!e.checked) {
//                 formik.setFieldValue('formule_condition', '');
//               }
//             }}
//             checked={checkedFormule}
//           />
//           <label className='ml-2'>Activer Formule Condition</label>
//           <Button
//             icon='pi pi-calculator'
//             className='cursor-pointer'
//             outlined
//             disabled={!checkedFormule}
//             onClick={() => handleClickCalc('condition')}
//           />
//         </div>
//         <InputText
//           className='h-full w-full text-xl font-normalborder-gray-600 border-1 p-2'
//           value={formik.values.formule_condition}
//           disabled={!checkedFormule}
//         />
//         <DialogComponent
//           header='Calculatrice'
//           visible={visibleCalcul}
//           onHide={hideCalcul}
//           className='md:w-5 right=0'
//         >
//           <CalculatorPopup
//             handleSaveCalc={(e) =>
//               saveFormule(
//                 e,
//                 typeFormule === 'condition' ? 'formule_condition' : 'formule_calcule'
//               )
//             }
//             type={typeFormule}
//           />
//         </DialogComponent>
//       </div>
//       <div className='shadow-md rounded-lg p-5 bg-white w-full mt-4'>
//         <h2 className='text-2xl font-semibold mb-4'>Formule Calcule</h2>
//         <InputText
//           className='h-full w-full text-xl font-normalborder-gray-600 border-1 p-2'
//           value={formik.values.formule_calcule}
//           required
//         />
//       </div>
//       <div className='shadow-md rounded-lg p-5 bg-white w-full mt-4'>
//         <div className='flex justify-content-end'>
//           <Button
//             label={<OlangItem olang='Save' />}
//             icon='pi pi-check'
//             iconPos='right'
//             onClick={formik.handleSubmit}
//             loading={loadingTar}
//             disabled={loadingTar}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NewTarif;


/* Nouveau formulaire */


import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ToggleButton } from 'primereact/togglebutton';
import CalculatorPopup from './components/CalculatorPopup';
//import { CalculatorPopup } from './components/CalculatorPopup';
import { DialogComponent } from '../../shared/DialogComponent';
import { useAppDispatch, useAppSelector } from '../../../hooks';

import {
  createOrUpdateTarif,
  fetchEtat,
  fetchMatrices,
  fetchNiveauSrcData,
  fetchParamsNiveau,
  fetchPrestation,
  getDataTarif,
  getEtatList,
  getFormuleCalcul,
  getFormuleCondition,
  getLoadingTar,
  getMatrices,
  getNiveauSrcData,
  getParamsNiveau,
  getPrestationList,
  getSelectedEtat,
  getSelectedPrestation,
  getSelectedSrcData,
  getSelectedTarif,
  getVisibleCalcul,
  setDataTarif,
  setFormuleCalcul,
  setFormuleCondition,
  setLoadingTar,
  setSelectedEtat,
  setSelectedPrestation,
  setSelectedSrcData,
  setVisibleCalcul,
  setVisibleNew,
} from '../slice/facturation.slice';
import DialogContent from './DialogContent';
import ButtonComponent from '../../shared/ButtonComponent';
import {
  ColumnsPrestation,
  ColumnsNiveauSrcDataDossier,
  ColumnsNiveauSrcDataClient,
  ColumnsEtat,
} from './columns';
import _ from 'lodash';
// import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { OlangItem } from '../../shared/Olang/user-interface/OlangItem/OlangItem';
import { getCustomers } from '../../../store/slices/customer.slice';
import { useFormik } from 'formik';
import { check } from 'prettier';


const NewTarif = () => {
  const [codeUnique, setCodeUnique] = useState('');
  const [description, setDescription] = useState('');
  const [appliquéSur, setAppliquéSur] = useState(null);
  const [formuleTarification, setFormuleTarification] = useState('');
  const [conditionApplication, setConditionApplication] = useState('');
  const [visibleModal, setVisibleModal] = useState(false);
  const [activeForm, setActiveForm] = useState('vente');

  const [selectedDossier, setSelectedDossier] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [checked, setChecked] = useState(false);

  const [checkedNiveau, setCheckedNiveau] = useState(false);
  const [checkedFormule, setCheckedFormule] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [visibleSrcData, setVisibleSrcData] = useState(false);
  const [visiblePrestation, setVisiblePrestation] = useState(false);
  const [visibleEtat, setVisibleEtat] = useState(false);
  const [prestationChange, setPrestationChange] = useState(null);
  const [etatChange, setEtatChange] = useState(null);
  const [srcDataChange, setSrcDataChange] = useState(null);
  const [typeFormule, setTypeFormule] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showClient, setShowClient] = useState(false);
  const applications = ['Dossier', 'Client'];
  const dispatch = useAppDispatch();
  let selectedPrestation = useAppSelector(getSelectedPrestation);
  let selectedEtat = useAppSelector(getSelectedEtat);
  let selectedSrcData = useAppSelector(getSelectedSrcData);
  let ParamsNiveau = useAppSelector(getParamsNiveau);
  let PrestationList = useAppSelector(getPrestationList);
  let EtatList = useAppSelector(getEtatList);
  let formuleCondition = useAppSelector(getFormuleCondition);
  let formuleCalcul = useAppSelector(getFormuleCalcul);
  let visibleCalcul = useAppSelector(getVisibleCalcul);
  let NiveauSrcData = useAppSelector(getNiveauSrcData);
  const dataTarif = useAppSelector(getDataTarif);
  const loadingTar = useAppSelector(getLoadingTar);
  const customers = useAppSelector(getCustomers);
  const tarif = useAppSelector(getSelectedTarif);

  const options = [
    { label: 'Dossier', value: 'dossier' },
    { label: 'Client', value: 'client' },
  ];

  const handleModalToggle = () => {
    setVisibleModal(!visibleModal);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createOrUpdateTarif({
      codeUnique,
      description,
      appliquéSur,
      selectedDossier,
      selectedClient,
      formuleTarification,
      conditionApplication,
    }));
  };

  const formik = useFormik({
    initialValues: {
      // codeAchat: '',
      // descriptionAchat: '',
      client: '',
      // prestationAchat: '',
      // descriptionEtatAchat: '',
      // id_tarif_filter_selection: '',
      // formuleConditionAchat: '',
      // formuleCalculeAchat: '',
      // valeur_filter_selection: '',

      // Id_tarifAchat: '',
      activeAchat: '',
      activeVente: '',
      codeAchat: '',
      codeVente: '',
      descriptionAchat: '',
      descriptionEtatAchat: '',
      descriptionEtatVente: '',
      descriptionVente: '',
      formuleCalculeAchat: '',
      formuleCalculeVente: '',
      formuleConditionAchat: '',
      formuleConditionVente: '',
      idFilterAchat: '',
      idFilterVente: '',
      client: '',
      modeAchat: '',
      modeVente: '',
      prestationAchat: '',
      prestationVente: '',
      srcAchat: '',
      srcIdAchat: '',
      srcIdVente: '',
      srcVente: '',
      valeurFilterAchat: '',
      valeurFilterVente: ''
    },
    onSubmit: (values) => {
      let data = {
        ...values,
        customerId: values?.client || '',
      };
      handleSaveTarif(data);
    },
  });

  const hideCalcul = () => {
    dispatch(setVisibleCalcul(false));
  };

  const handleSelection = (selectedInv) => {
    setSrcDataChange(selectedInv);
  };

  const handleSelectionPrestation = (selectedPrestation) => {
    setPrestationChange(selectedPrestation);
  };

  const saveFormuleVente = (formuleCondition, field) => {
    formik.setFieldValue(field, formuleCondition);
  };

  const saveFormuleAchat = (formuleCondition, field) => {
    formik.setFieldValue(field, formuleCondition);
  };

  const handleSelectionEtat = (selectedEtat) => {
    setEtatChange(selectedEtat);
  };

  const savePrestationVente = () => {
    dispatch(setSelectedPrestation(prestationChange));
    formik.setFieldValue('prestationVente', prestationChange.Produit);
    formik.setFieldValue('prestationAchat', prestationChange.Produit);
    setVisiblePrestation(false);
  };

  const savePrestationAchat = () => {
    dispatch(setSelectedPrestation(prestationChange));
    formik.setFieldValue('prestationAchat', prestationChange.Produit);
    formik.setFieldValue('prestationVente', prestationChange.Produit);
    setVisiblePrestation(false);
  };

  const saveEtatVente = () => {
    formik.setFieldValue('descriptionEtatVente', etatChange.Description);
    dispatch(setSelectedEtat(etatChange));
    setVisibleEtat(false);
  };

  const saveEtatAchat = () => {
    formik.setFieldValue('descriptionEtatAchat', etatChange.Description);
    dispatch(setSelectedEtat(etatChange));
    setVisibleEtat(false);
  };

  const saveSrcData = () => {
    formik.setFieldValue('valeur_filter_selection', srcDataChange?.OTID);
    dispatch(setSelectedSrcData(srcDataChange));
    dispatch(setVisibleSrcData(false));
  };

  const handleClickCalc = (type) => {
    setTypeFormule(type);
    dispatch(setVisibleCalcul(true));
  };

  const onInputChange = (e) => {
    let old = _.cloneDeep(dataTarif);
    old = { ...old, [e.target.name]: e.target.value };
    dispatch(setDataTarif(old));
  };

  const showCl = (e) => {
    if (!e.checked) {
      formik.setFieldValue('client', '');
      setSelectedCustomer(null);
    }
    setShowClient(e.checked);
  };

  const handleSaveTarif = (data) => {
    dispatch(setLoadingTar(true));
    dispatch(createOrUpdateTarif(data)).then((res) => {
      if (res.payload) {
        dispatch(setVisibleNew(false));
        dispatch(setDataTarif(null));
        dispatch(setLoadingTar(false));
      }
    });
  };

  const getValApplication = async (id) => {
    if (!Array.isArray(ParamsNiveau)) return;
    const findName = ParamsNiveau.find((item) => item.id == id);
    await dispatch(fetchNiveauSrcData(findName?.Code));
    setVisibleSrcData(true);
  };

  const footerSave = (handleSave) => (
    <div className='flex justify-content-end'>
      <Button
        label='Enregistrer'
        icon='pi pi-check'
        onClick={handleSave}
        className='p-button-success mr-2'
      />
    </div>
  );

  useEffect(() => {
    Promise.all([dispatch(fetchParamsNiveau()), dispatch(fetchPrestation()), dispatch(fetchEtat())])
      .then(() => {
        if (tarif?.id_tarif_filter_selection) {
          setCheckedNiveau(true);
        }
        // if (tarif?.formuleConditionVente) {
        //   setCheckedFormule(true);
        // }
        // if (tarif?.formuleConditionAchat) {
        //   setCheckedFormule(true);
        // }
        if (tarif && Object.keys(tarif).length !== 0) {
          formik.setValues(tarif);
        }
      })
      .catch((error) => {
        console.error('Error in requests:', error);
      });
  }, []);

  const footer = (
    <div className="flex justify-end gap-2">
      <Button label="Annuler" icon="pi pi-times" onClick={handleModalToggle} className="p-button-text" />
      <Button label="Confirmer" icon="pi pi-check" onClick={handleModalToggle} className="p-button-success" />
    </div>
  );

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto p-8 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow-lg mt-10 transition-transform duration-500 transform hover:scale-105">
        <h2 className="text-4xl font-semibold text-center text-gray-800 mb-6">Formulaire de Tarification</h2>
        <div className="relative border border-gray-900 mb-5 rounded">

          <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Informations de Prestation</h3>
          <div className="flex m-3 items-center gap-2 ">
            <div className="relative mb-2 flex-1">
              <div className="flex items-center">
                <InputText value={formik.values.prestationVente} className="block w-full h-4rem text-bold text-2xl borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Prestation Vente" />
                <Button icon="pi pi-pencil" onClick={() => setVisiblePrestation(true)} className="ml-2 bg-blue-300" />

                <DialogComponent
                  header='Selected Item'
                  visible={visiblePrestation}
                  footer={() => footerSave(savePrestationVente)}
                  onHide={() => setVisiblePrestation(false)}
                  className='md:w-7 md:h-auto right-0'
                  position='bottom'
                >
                  <DialogContent
                    tableId='table_prestation'
                    columns={ColumnsPrestation}
                    data={PrestationList}
                    onSelections={handleSelectionPrestation}
                    selectionMode='single'
                    onAddButtonClick={savePrestationVente}
                    isDataSelectable={true}
                    selectionRowsProps={true}
                    selectedRow={selectedPrestation}
                  />
                </DialogComponent>
              </div>
            </div>
          </div>

        </div>
        {/* Paramétrage */}
        <div className="flex justify-between mb-4">
          <button
            className={`flex-1 transition duration-300 ease-in-out transform py-2 px-6 mx-2 ${activeForm === 'vente' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg hover:scale-105`}
            onClick={() => setActiveForm('vente')}
          >
            Tarif Vente
          </button>
          <button
            className={`flex-1 transition duration-300 ease-in-out transform py-2 px-6 mx-2 ${activeForm === 'achat' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} rounded-lg hover:scale-105`}
            onClick={() => setActiveForm('achat')}
          >
            Tarif Achat
          </button>
        </div>
        {activeForm === "vente" && (
          <div>
            {/* Code et description */}
            <div className="flex m-3">
              <div className="flex-1 mr-2">
                <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Code Tarif Vente</label>
                <InputText
                  onChange={formik.handleChange}
                  value={formik.values.codeVente}
                  // disabled={tarif?.id_tarif || false}
                  className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder='Code Vente' />
              </div>
              <div className="flex-1 ml-2">
                <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Description Vente</label>
                <InputText name='descriptionVente'
                  value={formik.values.descriptionVente}
                  onChange={formik.handleChange}
                  placeholder="Description vente"
                  className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
              </div>
            </div>

            {/* Cible de la prestation */}
            <div className="relative border border-gray-900 mb-5 rounded">

              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Sur qui le tarif sera appliqué?</h3>
              <div className="relative m-3 justify-between gap-x-5">
                {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Cible de la Prestation</label> */}
                <div className="flex">
                  <Dropdown value={appliquéSur} options={options} onChange={(e) => {
                    setAppliquéSur(e.value);
                    if (e.value === 'dossier') {
                      setSelectedClient(null);
                    } else {
                      setSelectedDossier(null);
                    }
                  }} placeholder="Sélectionner" className="w-full borderborder-gray-600 rounded-md bg-white flex-1" />
                  {appliquéSur === 'client' && (
                    <Dropdown
                      name='client'
                      label="Select Version"
                      placeholder='Selectionner un client'
                      className='h-3rem borderborder-gray-600 rounded-md w-full ml-2'
                      value={formik.values.client}
                      filter
                      // disabled={!showClient}
                      optionValue='ClientID'
                      optionLabel='Nom'
                      options={customers}
                      onChange={formik.handleChange}
                    />
                  )}
                  <div>
                    <div className="flex-1 ml-2">
                      {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Valeur</label> */}
                      <div className="flex items-center">
                        <InputText name='valeur'
                          className='p-2 borderborder-gray-600 rounded-md'
                          value={formik.values.valeurFilterVente}
                          disabled={!formik.values.valeurFilterVente || !checkedNiveau} />
                        <Button icon="pi pi-cog" onClick={() => getValApplication(formik.values.id_tarif_filter_selection)}

                          // disabled={!formik.values.valeurFilterVente || !checkedNiveau} 
                          className="ml-2 bg-blue-300" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {/*  */}

            {/*  */}
            <div className="relative border border-gray-900 mb-5 rounded">

              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Appliquer une condition de tarification à la formule</h3>
              <div className="relative m-3">
                {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Appliquer une condition à la formule</label> */}
                <div className="flex items-center my-5">
                  <InputText value={formik.values.descriptionEtatVente} className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Etat" />
                  <Button icon="pi pi-pencil" onClick={() => setVisibleEtat(true)} className="ml-2 bg-blue-300" />


                  <DialogComponent
                    header='Selected Item'
                    visible={visibleEtat}
                    footer={() => footerSave(saveEtatVente)}
                    onHide={() => setVisibleEtat(false)}
                    className='md:w-7 right-0'
                    position='right-20'
                  >
                    <DialogContent
                      tableId='table etat'
                      columns={ColumnsEtat}
                      data={EtatList}
                      onSelections={handleSelectionEtat}
                      selectionMode='single'
                      onAddButtonClick={saveEtatVente}
                      isDataSelectable={true}
                      selectionRowsProps={true}
                      selectedRow={selectedEtat}
                    />
                  </DialogComponent>
                </div>
                <div className="flex items-center">
                  <InputText value={formik.values.formuleConditionVente} className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Entrez la condition ici" />
                  <Button icon="pi pi-calculator" className="ml-2 bg-white text-black text-bold  cursor-pointer"
                    outlined
                    // disabled={!checkedFormule}
                    onClick={() => handleClickCalc('condition')} />
                </div>
              </div>
            </div>
            {/*  */}
            <div className="relative border border-gray-900 mb-5 rounded">
              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Formule Finale de Tarification</h3>
              <div className="relative m-3">
                {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Formule Finale de Tarif Vente</label> */}
                <div className="flex items-center">
                  <InputText value={formik.values.formuleCalculeVente} className="block w-full h-4rem text-2xl text-bold border mr-3 border-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Entrez la formule ici" />
                  <Button icon="pi pi-calculator" onClick={() => handleClickCalc('calcule')} className="ml-2bg-white text-black text-bold  cursor-pointer" outlined />
                </div>
              </div>
            </div>

            {/*  */}

            <DialogComponent
              header='Selected Item'
              visible={visibleSrcData}
              footer={() => footerSave(saveSrcData)}
              onHide={() => setVisibleSrcData(false)}
              className='md:w-7 right-0'
              position='bottom-right'
            >
              <DialogContent
                tableId='table SrcData'
                columns={
                  formik.values.id_tarif_filter_selection == 1
                    ? ColumnsNiveauSrcDataDossier
                    : ColumnsNiveauSrcDataClient
                }
                data={NiveauSrcData}
                onSelections={handleSelection}
                selectionMode='single'
                addBtn={false}
                isDataSelectable={true}
                selectionRowsProps={true}
                selectedRow={srcDataChange}
              />
            </DialogComponent>

            <DialogComponent
              header='Calculatrice'
              visible={visibleCalcul}
              onHide={hideCalcul}
              className='md:w-5 right-0'
            >
              <CalculatorPopup
                handleSaveCalc={(e) =>
                  saveFormuleVente(
                    e,
                    typeFormule === 'condition' ? 'formuleConditionVente' : 'formuleCalculeVente'
                  )
                }
                type={typeFormule}
              />
            </DialogComponent>

          </div>)}
        {activeForm === "achat" && (
          <div>
            {/* Code et Description */}

            <div className="flex m-3">
              <div className="flex-1 mr-2">
                <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Code Tarif Achat</label>
                <InputText
                  onChange={formik.handleChange}
                  value={formik.values.codeAchat}
                  // disabled={tarif?.id_tarif || false}
                  className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder='Code Vente' />
              </div>
              <div className="flex-1 ml-2">
                <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Description Achat</label>
                <InputText name='descriptionAchat'
                  value={formik.values.descriptionAchat}
                  onChange={formik.handleChange}
                  placeholder="Description Achat"
                  className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
              </div>
            </div>


            {/* Cible de la prestation */}
            <div className="relative border border-gray-900 mb-5 rounded">

              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Sur qui le tarif sera appliqué?</h3>
              <div className="relative m-3 justify-between gap-x-5">
                <div></div>
                <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Cible de la Prestation</label>
                <div className="flex">
                  <Dropdown value={appliquéSur} options={options} onChange={(e) => {
                    setAppliquéSur(e.value);
                    if (e.value === 'dossier') {
                      setSelectedClient(null);
                    } else {
                      setSelectedDossier(null);
                    }
                  }} placeholder="Sélectionner" className="w-full borderborder-gray-600 rounded-md bg-white flex-1" />
                  {appliquéSur === 'client' && (
                    <Dropdown
                      name='client'
                      label="Select Version"
                      placeholder='Selectionner un client'
                      className='h-3rem borderborder-gray-600 rounded-md w-full ml-2'
                      value={formik.values.client}
                      filter
                      // disabled={!showClient}
                      optionValue='ClientID'
                      optionLabel='Nom'
                      options={customers}
                      onChange={formik.handleChange}
                    />
                  )}
                  <div>
                    <div className="flex-1 ml-2">
                      {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Valeur</label> */}
                      <div className="flex items-center">
                        <InputText name='valeur'
                          className='p-2 borderborder-gray-600 rounded-md'
                          value={formik.values.valeur_filter_selection}
                          disabled={!formik.values.id_tarif_filter_selection || !checkedNiveau} />
                        <Button icon="pi pi-cog" onClick={() => getValApplication(formik.values.id_tarif_filter_selection)}
                          disabled={!formik.values.id_tarif_filter_selection || !checkedNiveau} className="ml-2 bg-blue-300" />
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
            {/*  */}

            {/*  */}
            <div className="relative border border-gray-900 mb-5 rounded">

              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Appliquer une condition de tarification à la formule</h3>
              <div className="relative m-3">
                {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Appliquer une condition à la formule d'Achat</label> */}
                <div className="flex items-center my-5">
                  <InputText value={formik.values.descriptionEtatAchat} className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Etat Achat" />
                  <Button icon="pi pi-pencil" onClick={() => setVisibleEtat(true)} className="ml-2 bg-blue-300" />


                  <DialogComponent
                    header='Selected Item'
                    visible={visibleEtat}
                    footer={() => footerSave(saveEtatAchat)}
                    onHide={() => setVisibleEtat(false)}
                    className='md:w-7 right-0'
                    position='right-20'
                  >
                    <DialogContent
                      tableId='table etat'
                      columns={ColumnsEtat}
                      data={EtatList}
                      onSelections={handleSelectionEtat}
                      selectionMode='single'
                      onAddButtonClick={saveEtatAchat}
                      isDataSelectable={true}
                      selectionRowsProps={true}
                      selectedRow={selectedEtat}
                    />
                  </DialogComponent>
                </div>
                <div className="flex items-center">
                  <InputText value={formik.values.formuleConditionAchat} className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Entrez la condition ici" />
                  <Button icon="pi pi-calculator" className="ml-2 bg-blue-300 cursor-pointer"
                    outlined
                    // disabled={!checkedFormule}
                    onClick={() => handleClickCalc('condition')} />
                </div>
              </div>
            </div>
            {/*  */}
            <div className="relative border border-gray-900 mb-5 rounded">
              <h3 className="text-sm font-semibold text-left text-gray-800 m-3">Formule Finale de Tarification</h3>
              <div className="relative m-3">
                {/* <label className="flex items-center mb-1 text-gray-600 text-sm font-medium">Formule Finale de Tarification</label> */}
                <div className="flex items-center">
                  <InputText value={formik.values.formuleCalculeAchat} className="block w-full h-4rem text-2xl text-bold borderborder-gray-600 rounded-md placeholder-gray-400 bg-white transition duration-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200" placeholder="Entrez la formule ici" />
                  <Button icon="pi pi-calculator" onClick={() => handleClickCalc('calcule')} className="ml-2 bg-blue-300 cursor-pointer" />
                </div>
              </div>
            </div>

            {/*  */}

            <DialogComponent
              header='Selected Item'
              visible={visibleSrcData}
              footer={() => footerSave(saveSrcData)}
              onHide={() => setVisibleSrcData(false)}
              className='md:w-7 right-0'
              position='bottom-right'
            >
              <DialogContent
                tableId='table SrcData'
                columns={
                  formik.values.id_tarif_filter_selection == 1
                    ? ColumnsNiveauSrcDataDossier
                    : ColumnsNiveauSrcDataClient
                }
                data={NiveauSrcData}
                onSelections={handleSelection}
                selectionMode='single'
                addBtn={false}
                isDataSelectable={true}
                selectionRowsProps={true}
                selectedRow={srcDataChange}
              />
            </DialogComponent>

            <DialogComponent
              header='Calculatrice'
              visible={visibleCalcul}
              onHide={hideCalcul}
              className='md:w-5 right=0'
            >
              <CalculatorPopup
                handleSaveCalc={(e) => {
                  saveFormuleAchat(
                    e,
                    typeFormule === 'condition' ? 'formuleConditionAchat' : 'formuleCalculeAchat'
                  )
                }
                }
                type={typeFormule}

              />
            </DialogComponent>

          </div>)}

        <div className="mt-6">
          <Button label="Sauvegarder" icon="pi pi-save" type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-800 transition-all duration-300 text-white font-semibold rounded-md shadow-lg" onClick={formik.handleSubmit}
            loading={loadingTar}
            disabled={loadingTar} />
        </div>
      </form>
    </>
  );

};

export default NewTarif;