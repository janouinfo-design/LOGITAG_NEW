import React, { useEffect } from 'react'
import { InputNumber, InputText, InputTextarea } from 'primereact'
import { Button } from 'primereact'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createOrUpdateCustomer, getEditCustomer, getSelectedCustomer, setEditCustomer, setSelectedCustomer } from '../../../store/slices/customer.slice'
// import { getToastParams, setToastParams } from '../../../../store/slices/ui.slice'
import { DialogComponent } from '../../shared/DialogComponent/DialogComponent'

export const CustomerEditor = (props) => {
    const [inputs, setInputs] = useState({})
    const [isValid, setIsValid] = useState(false)
    const selectedCustomer = useSelector(getSelectedCustomer)
    const editCustomer = useSelector(getEditCustomer)
    const dispatch = useDispatch()
    const onHide = () => {
        (typeof props.onHide == "function") && props.onHide();
        dispatch(setEditCustomer(false))
    }

    const mandatories = ['category','customer']

    const onInputChange = (e, key , val) => {
        const data = { ...inputs, [key || e.target.name]: val || e.target.value }
        if (data) {
            let valid = true
            for (const key of mandatories) {
                if (!data[key] || (Array.isArray(data[key]) && data[key].length == 0))
                    valid = false
            }
            setIsValid(valid)
        } else {
            setIsValid(false)
        }

        dispatch(setSelectedCustomer(data))

    }

    useEffect(() => {
        setInputs(selectedCustomer || {})
    }, [selectedCustomer])

    

    const onSave = async () => {
        let res = (await dispatch(createOrUpdateCustomer())).payload

        // if (!res.success)
        //     dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
        // else {
        //     dispatch(setToastParams({ show: true, severity: 'error', summary: "ERREUR", detail: "Opération échoué. Veuillez réessayer !!!" }))
        //     dispatch(setToastParams({ severity: 'success' }));
        //     (typeof props.onSave == "function") && props.onSave();
        //     onHide()
        // }
    }

    const footer = (
        <div className='flex gap-3 justify-content-end'>
            <Button onClick={onHide} className=" p-button-danger" label={"Annuler"} icon="pi pi-times" />
            <Button disabled={!isValid} onClick={onSave} label={"Sauvegarder"} icon="pi pi-check" />
        </div>
    )
    return (
        <div>
            <DialogComponent visible={editCustomer}
                header={!inputs?.id ? "Nouveau client" : "Modification de client"}
                // style={{ width: '50vw' }}
                onHide={onHide}
                className="w-11 md:w-6"
                footer={footer}
            >

                <div>
                    <div className="my-4 mt-5">
                        <label htmlFor="category">Nom client</label>
                        <InputText name="category"
                            id="category"
                            required={true}
                            value={inputs.category}
                            onChange={onInputChange}
                            className='w-full' />
                    </div>
                    <div className="my-4">
                        <label htmlFor="description">Label client</label>
                        <InputTextarea id="description"
                            rows={5}
                            value={inputs.description}
                            onChange={onInputChange}
                            name="description"
                            className='w-full' />
                    </div>
                </div>
            </DialogComponent>
        </div>
    )
}
