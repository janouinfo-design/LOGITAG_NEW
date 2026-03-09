import React, { useEffect, useState } from 'react'
import { Fieldset } from 'primereact/fieldset';
import { Divider } from 'primereact/divider';

import { DialogComponent } from '../../../shared/DialogComponent/DialogComponent'
import { OlangItem } from '../../../shared/Olang/user-interface/OlangItem/OlangItem'
import { InputText } from 'primereact/inputtext'
import { Calendar } from 'primereact/calendar'
import { useFormik } from 'formik'
import ButtonComponent from '../../../shared/ButtonComponent/ButtonComponent'
import { useAppDispatch, useAppSelector } from '../../../../hooks'
import { getSelectedInvoices, getShowCreateFac, setShowCreateFac } from '../../slice/elementFacturable.slice'
import { getDataClient, getDataDeposit, getSelectedClientFc, invoiceSave } from '../../slice/facture.slice'
import { DataTable } from 'primereact/datatable'
import { DatatableComponent } from '../../../shared/DatatableComponent/DataTableComponent'
import moment from 'moment';

const UpdateFacture = ({ ftactureId = 0 }) => {
    const [selectedArow, setSelectedArow] = useState([])
    let SelecttedLineFacture = useAppSelector(getSelectedInvoices)
    let selectClientData = useAppSelector(getDataClient);
    let getDepositData = useAppSelector(getDataDeposit);
    if (Array.isArray(selectClientData))
        selectClientData = selectClientData[0] ?? null
    if (Array.isArray(getDepositData))
        getDepositData = getDepositData[0] ?? null
    const dispatch = useAppDispatch()

    const visible = useAppSelector(getShowCreateFac)
    const selectedClient = useAppSelector(getSelectedClientFc)
    const columns = [
        // {
        //   header: 'OTID',
        //   olang: 'OTID',
        //   // field: 'OTID',
        //   body: detailsTemplate,
        // },
        {
            header: 'N° de BL (ou dossier)',
            field: 'OTNoBL',
            // olang: 'N°.de.BL',
            filter: true,
        },
        {
            header: 'Produit',
            field: 'Produit',
            olang: 'Produit',
            filter: true,
        },
        // {
        //   header: 'OTDateLivraison',
        //   field: 'OTDateLivraison',
        //   olang: 'OTDateLivraison',
        //   filter: true,
        // },
        // {
        //   header: 'invoiceId',
        //   field: 'invoiceId',
        //   olang: 'invoiceId',
        // },
        // {
        //   header: 'invoiceLineId',
        //   field: 'invoiceLineId',
        //   olang: 'invoiceLineId',
        // },
        {
            header: 'DDO1',
            olang: 'DDO1',
            field: 'DDO1',
            filter: true,
        },
        // {
        //   header: 'OTDateAcquitement',
        //   olang: 'OTDateAcquitement',
        //   field: 'OTDateAcquitement',
        //   filter: true,

        //   //body: activeTemplate,
        // },
        {
            header: 'CLIENT',
            field: 'CLIENT',
            olang: 'CLIENT',
            filter: true,
        },
        {
            header: 'Magasin',
            field: 'Magasin',
            olang: 'Magasin',
            filter: true,
        },
        {
            header: 'Prix',
            field: 'Prix',
            olang: 'Prix',
            filter: true,
        },
        {
            header: 'Ville',
            field: 'Ville',
            olang: 'Ville',
            filter: true,
        },
        {
            header: 'OTDESTNP',
            field: 'OTDESTNP',
            olang: 'OTDESTNP',
            filter: true,
        },
        {
            header: 'VMM',
            field: 'VMM',
            olang: 'VMM',
            filter: true,
        },
        {
            header: 'OTEtat',
            field: 'OTEtat',
            olang: 'OTEtat',
            filter: true,
        },
        {
            header: 'RefCmdClient',
            field: 'RefCmdClient',
            olang: 'RefCmdClient',
            filter: true,
        },
        // {
        //   header: 'servicestatutDate',
        //   field: 'servicestatutDate',
        //   olang: 'servicestatutDate',
        //   filter: true,
        // },
        {
            header: 'OTNoBL',
            field: 'OTNoBL',
            olang: 'OTNoBL',
            filter: true,
        },
    ]

    let actions = [
        {
            label: 'Supprimer',
            icon: 'pi pi-trash text-red-500',
            command: (e) => {
                //dispatch(setSelectedInvoice(e.item.data))
                //dispatch(removeInvoice(e.item.data))
            },
        },
        {
            label: 'Detail',
            icon: 'pi pi-eye text-blue-500',
            command: (e) => {
                // goLink(e.item.data.OTID)
                //dispatch(setSelectedInvoice(e.item.data))
                //navigate('/detailsTest')
            },
        },
    ]
    const formik = useFormik({
        initialValues: {
            description: '',
            date: '',
            reference: ''
        },
        onSubmit: (values) => {
            let factureLineClear = JSON.parse(localStorage.getItem('element-Afacture-configs'));
            const transformedData = factureLineClear.selection.map(item => ({ serviceId: item.serviceId }));

            let obj = {
                description: values.description,
                orderDate: values.date,
                customerId: selectedClient?.value,
                reference: values.reference
            }
            dispatch(invoiceSave({ id: 0, info: obj, Services: transformedData })).then(({ payload }) => {

                if (payload) {
                    let factureLineClear = JSON.parse(localStorage.getItem("element-Afacture-configs"));
                    factureLineClear.selection = [];
                    localStorage.setItem("element-Afacture-configs", JSON.stringify(factureLineClear));
                    dispatch(setShowCreateFac(false))
                }
            })
        },
    })

    const header = (
        <div className='flex align-items-center'>
            <span className='font-normal'>
                <OlangItem olang='dateImpression' />
            </span>

            <div className='ml-3 text-lg font-bold font-semibold'> {moment(new Date()).format('DD-MM-YYYY HH:mm')}</div>
        </div>

    )

    const onHide = () => {

        dispatch(setShowCreateFac(false))
    }

    useEffect(() => {

    }, []);
    return (
        <DialogComponent
            header={header}
            visible={visible}
            onHide={onHide}
            className='md:w-6 right-0'
            position='right'
        >
            <div class="grid">
                <div class="col">
                    <img src={process.env.REACT_APP_IMAGE_BASE_URL + '/logos/logo.png'} alt="" style={{ 'width': '80%' }} />
                </div>

                <div class="col">
                    <div
                        style={{ 'text-align': 'end' }}
                        className='flex-1 border-0   justify-content-end flex-wrap  font-bold m-2 px-5 py-3 border-round'
                    >
                        <div className='w-full'>
                            <p>
                                <div className='p-m-4'>
                                    <h2>
                                        {getDepositData?.client}
                                    </h2>
                                    <ul className='p-list p-component' style={{ listStyle: 'none', padding: 0 }}>
                                        <li>{getDepositData?.adresse}</li>
                                        <li>{getDepositData?.NP}</li>
                                        <li>{getDepositData?.Ville} </li>
                                        <li>{getDepositData?.Tel}</li>
                                    </ul>
                                </div>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
            <div className='overflow-hidden'>
                <div className='flex'>
                    <div className='flex-1 border-0 flex align-items-center justify-content-center  font-bold m-2 px-5 py-3 border-round'>
                        <div className='w-full'>
                            <p>
                                <div className='p-m-4'>
                                    <h2>
                                        {selectClientData?.client} - {selectClientData?.CodeClient}
                                    </h2>
                                    <ul className='p-list p-component' style={{ listStyle: 'none', padding: 0 }}>
                                        <li>{selectClientData?.adresse}</li>
                                        <li>{selectClientData?.NP}</li>
                                        <li>{selectClientData?.Ville} </li>
                                        <li>{selectClientData?.Tel}</li>
                                    </ul>
                                </div>
                            </p>
                        </div>
                    </div>
                    <div
                        style={{ 'text-align': 'end' }}
                        className='flex-1 border-0   justify-content-end flex-wrap  font-bold m-2 px-5 py-3 border-round'
                    >
                        <div className='w-full'>
                            <p>
                                <div className='p-m-4'>

                                    <ul className='p-list p-component' style={{ listStyle: 'none', padding: 0 }}>
                                        <li>
                                            <b olang='reference'>reference</b>: {formik.values?.reference}
                                        </li>
                                        <li>
                                            <b olang='date'>date</b>:{' '}
                                            {moment(formik?.values?.date || new Date()).format('DD-MM-YYYY')}
                                        </li>
                                    </ul>
                                </div>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex flex-column w-full '>
                <div className='flex flex-row w-full justify-content-around'>
                    <div className='flex flex-row w-5 justify-content-between'>
                        <div className='text-xl font-normal'>
                            <OlangItem olang='reference' />
                        </div>
                        <InputText
                            className='w-8'
                            name='reference'
                            placeholder='Reference'
                            value={formik.values.reference}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className='flex flex-row w-5 justify-content-between ml-5'>
                        <div className='text-xl font-normal'>
                            <OlangItem olang='Description' />
                        </div>
                        <InputText
                            className='w-8'
                            name='description'
                            placeholder='Description'
                            value={formik.values.description}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className='flex flex-row w-4 justify-content-between ml-5'>
                        <div className='text-xl font-normal'>
                            <OlangItem olang='date' />
                        </div>
                        <Calendar
                            onChange={formik.handleChange}
                            value={formik.values.date}
                            name='date'
                            dateFormat='dd/mm/yy'
                            placeholder='dd/mm/yyyy'
                            showIcon
                        />
                    </div>
                </div>

                <div className='p-datatable p-component'>
                    <div className='p-datatable-wrapper'>
                        <table className='p-datatable-table'>
                            <thead className='p-datatable-thead'>
                                <tr>
                                    <th className='p-datatable-header'><OlangItem olang='OTNoBL' /></th>
                                    <th className='p-datatable-header'><OlangItem olang='Service' /></th>
                                    <th className='p-datatable-header'><OlangItem olang='DeliveryDate' /></th>
                                    <th className='p-datatable-header'><OlangItem olang='NP' /></th>
                                    <th className='p-datatable-header'><OlangItem olang='Price' /></th>
                                </tr>
                            </thead>
                            <tbody className='p-datatable-tbody'>
                                {SelecttedLineFacture?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="p-datatable-cell">{item.OTNoBL}</td>
                                        <td className="p-datatable-cell">{item.Produit}</td>
                                        <td className="p-datatable-cell">{item.OTDateLivraison}</td>
                                        <td className="p-datatable-cell">{item.OTDESTNP}</td>
                                        <td className="p-datatable-cell">{item.Prix}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='flex flex-row w-full mt-4 justify-content-end'>
                    <ButtonComponent label='Annuler' severity='danger' onClick={onHide} />
                    <ButtonComponent
                        label='Enregistrer'
                        severity='success'
                        className='ml-2'
                        onClick={formik.handleSubmit}
                    />
                </div>
            </div>
        </DialogComponent>
    )
}

export default UpdateFacture
