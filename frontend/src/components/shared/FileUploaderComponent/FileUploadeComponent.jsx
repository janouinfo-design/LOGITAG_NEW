import {FileUpload} from 'primereact'
import {useRef} from 'react'
import './style/style.css'
import {FilesToBase64} from '../../../api/files'
import axios from 'axios'
import {_saveFile, _uploadFile} from './api'
import { Toast } from 'primereact/toast'



export const FileUploadeComponent = ({
  ref,
  onChange,
  accept,
  auto,
  onUpload,
  base64Only,
  uploadUrl,
  uploadExtraInfo = {src: 'default', srcID: 0, desc: 'default', id: 0},
  onUploadFinished,
  uploadDataFormat,
}) => {

  const toast = useRef(null);

  const uploader = useRef()
  const chooseOptions = {
    iconOnly: true,
    icon: 'pi pi-fw pi-image',
    className: 'custom-choose-icon p-button-rounded p-button-outlined',
  }
  const cancelOptions = {
    iconOnly: true,
    icon: 'pi pi-times',
    className: 'p-button-warning p-button-rounded p-button-outlined',
  }
  const uploadOptions = {
    iconOnly: true,
    icon: 'pi pi-file-pdf d-none',
    className:
      'custom+choose-icon  p-button-rounded p-button-outlined d-none ' +
      (typeof onUpload !== 'function' && !uploadUrl && auto === false && 'hidden'),
  }

  const extraInfo = uploadExtraInfo || {}
  extraInfo.srcID = extraInfo.srcID || '0'
  extraInfo.src = extraInfo.src || '0'
  extraInfo.desc = extraInfo.desc || '0'
  const itemTemplate = (file, props, options) => {
    const index = file.name.lastIndexOf('.')

    let name = file.name.substr(0, index)
    name = name.substr(0, 18)
    name = name.length > 10 ? name.substr(0, 6) + '...' : name
    let extention = file.name.slice(index)
    let style = {
      width: '90px',
      height: '90px',
      backgroundImage: `url(${file.objectURL})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }

    if (!file.objectURL) {
      delete style.backgroundImage
      style.background = '#eee'
    }
    return (
      <div className='flex flex-column p-2 justify-content-center align-items-center' style={style}>
        <strong style={{fontSize: '12px'}} className='block'>
          {!file.objectURL ? name + extention : name + extention}
        </strong>
        <span style={{fontSize: '8px'}} className='bg-blue-50 mt-2 text-blue-600 px-2 py-1'>
          {props.formatSize}
        </span>
        <span
          onClick={props.onRemove}
          className='mt-2 pi pi-times 0  text-xs text-red-500 bg-red-50 hover:bg-red-100 cursor-pointer p-1 border-circle'
        ></span>
      </div>
    )
  }

  const updateFiles = (e) => {
    setTimeout(async () => {
      if (typeof onChange == 'function')
        onChange(
          base64Only === false
            ? uploader.current.getFiles()
            : await FilesToBase64(uploader.current.getFiles())
        )

      handleUpload()
    }, 1000)
  }

  const handleUpload = async () => {
    try {
      let f =
        base64Only === false
          ? uploader.current.getFiles()
          : await FilesToBase64(uploader.current.getFiles())
      if (f.length > 0 && uploader.current.getFiles()[0].size <= 1024 * 1024) { 
        if (auto === false) return
        if (uploader.current.getFiles().length > 0) {
          let fd = new FormData()
          fd.append('File', uploader.current.getFiles()[0])

          let x = Math.floor(Math.random() * 10000000 + 1)
          let uploadRes = await _uploadFile(fd, {
            name: extraInfo.srcID + extraInfo.desc + extraInfo.src + '_' + x,
          })

          let saveRes = null

          if (uploadRes.success) {
            let obj = {
              src: extraInfo.src,
              srcID: extraInfo.srcID,
              desc: extraInfo.desc,
              path: uploadRes.result.result,
              id: extraInfo.id,
            }

            saveRes = await _saveFile(obj)
          }
          if (typeof onUploadFinished == 'function') onUploadFinished(saveRes, uploadRes)
        }
      }
      else{
        // alert("File size should be less than or equal to 1MB.");
        toast.current.show({severity:'error', summary: 'Error', detail:'File size should be less than or equal to 1MB.', life: 3000});

        return
      }
      if (typeof onUpload == 'function') onUpload(f)
      if (typeof uploadUrl == 'string' && uploadUrl) {
        let filesToSend =
          base64Only === false ? await FilesToBase64(uploader.current.getFiles()) : f
        const hasFormat = Array.isArray(uploadDataFormat) && uploadDataFormat?.length > 0
        filesToSend = filesToSend
          .filter(({success}) => success)
          .map((_f) => {
            if (hasFormat) {
              let obj = {}
              for (let k of uploadDataFormat) {
                obj[k] = _f.result[k]
              }
              return obj
            }

            return _f.result.base64
          })

        return

        await axios
          .post(uploadUrl, filesToSend)
          .then((response) => {
            if (typeof onUploadFinished == 'function')
              onUploadFinished({success: true, result: response.data})
          })
          .catch((error) => {
            console.log('[UPLOAD ERROR]:', error.message)
            if (typeof onUploadFinished == 'function')
              onUploadFinished({success: false, result: error.message})
          })
      }
    } catch (e) {
    }
  }

  const _handleUpload = async () => {
  }

  return (
    <>
    <Toast ref={toast} position='bottom-right' />
      <FileUpload
        chooseOptions={chooseOptions}
        uploadOptions={uploadOptions}
        cancelOptions={cancelOptions}
        ref={uploader}
        contentClassName='flex flex-direction-row flex-wrap'
        multiple
        onRemove={updateFiles}
        onClear={updateFiles}
        accept={accept || '*'}
        onSelect={updateFiles}
        itemTemplate={itemTemplate}
        customUpload
        //uploadHandler={_handleUpload}
        className='w-12'
      />
    </>
  )
}
