import { memo, useEffect } from 'react'
import { InputText } from 'primereact'
import { Button } from 'primereact'
import { useState } from 'react'
// import { getToastParams, setToastParams } from '../../../../store/slices/ui.slice'
import { DialogComponent } from '../../../DialogComponent/DialogComponent'
import { createOrUpdateLang, getCurrentLang, getEditLang, getLangEditParams, setLangEditParams } from '../../slice/olang.slice'
import { useAppDispatch, useAppSelector } from '../../../../../hooks'

const OlangEditor = (props) => {
    const [inputs, setInputs] = useState({})
    const [isValid, setIsValid] = useState(false)
    const editParams = useAppSelector(getLangEditParams)
    const editLang = useAppSelector(getEditLang)
    const currentLang = useAppSelector(getCurrentLang)
    const [isCodeError , setIsCodeError] = useState(false)
    const [isTextError , setIsTextError] = useState(false)

    const dispatch = useAppDispatch()
    const codeRegx = /^[A-Za-z0-9._]+$/g
    const textRegx = /[:}{\\]+/g

    const onHide = () => {
        (typeof props.onHide == "function") && props.onHide();
        dispatch(setLangEditParams({...editParams, show: false }))
    }

    const mandatories = ['text']

    const onInputChange = (e) => {
        const data = { ...inputs, [e.target.name]:  e.target.value }
        setInputs(data)
        if(textRegx.test(e.target.value)){
            setIsTextError(true);
        }else{
            setIsTextError(false);
        }
        // dispatch(setSelectedCustomer(data))
    }



    useEffect(() => {
        setInputs(editParams || {})
        if(!codeRegx.test(editParams?.code || '')){
            setIsCodeError(true)
        }else{
            setIsCodeError(false)
        }
    }, [editParams])

    useEffect(()=> {
        if (inputs) {
            let valid = true
            for (const key of mandatories) {
                if (!inputs[key] || (Array.isArray(inputs[key]) && inputs[key].length == 0))
                    valid = false
            }
            setIsValid(valid)
        } else {
            setIsValid(false)
        }
    }, [inputs])

    

    const onSave = async () => {
        let res = (await dispatch(createOrUpdateLang({code: inputs.code , text: inputs.text , lang: currentLang}))).payload
    }

    const footer = (
        <div className='flex gap-3 justify-content-end'>
            <Button onClick={onHide} className=" p-button-danger" label={"Annuler"} icon="pi pi-times" />
            <Button disabled={!isValid || isCodeError || isTextError} onClick={onSave} label={"Sauvegarder"} icon="pi pi-check" />
        </div>
    )
    return (
        <div>
            <DialogComponent visible={editLang && editParams.show}
                header={editParams?.code + `[${currentLang}]`}
                style={{ width: '20vw' }}
                onHide={onHide}
                className="w-11 md:w-4"
                footer={footer}
            >
                <div>
                    <div className="my-4 mt-5">
                        <label htmlFor="text">Traduction</label>
                        <InputText name="text"
                            disabled={isCodeError}
                            required={true}
                            value={inputs.text}
                            onChange={onInputChange}
                            className='w-full' />
                    </div>
                </div>
                <div className='text-danger'>
                    { !isCodeError && !isTextError ? null : (
                        isCodeError ? `Format incorrect pour le code olang [${editParams?.code}].
                                       Ne doit contenir que des caractere alphanumerique ou un ".". Veuillez le modifiez`:
                                       `Format incorrect pour le text 
                                        ne doit pas contenir les caractere: "}" "{" ou ":"`
                    )}
                </div>
            </DialogComponent>
        </div>
    )
}


export default memo(OlangEditor)