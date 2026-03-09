import React, { useRef , useState} from 'react'

export const FileDisplayerComponent = ({files ,   options}) => {
    const [current , setCurrent] = useState('')
    const linkRef = useRef()

    if(!Array.isArray(files)) return null

    
    options = options || {}
    if(typeof options.onAction != 'function') 
        options.onAction = (data)=> {
            setCurrent(data);
            setTimeout( ()=> linkRef.current.click() , 100)
        }
    let cpt = 0
    let render = (f)=> {
        cpt++
        let uri = f[options.key || 'url']
        if(!uri) return null
        let url = uri
        let $name = uri.substr(uri.lastIndexOf('/')+1)
        const index = uri.lastIndexOf('.');
    
        let name = $name.substr(0, index)
        name = name.substr(0, 18);
        name = name.length > 10 ? name.substr(0, 6) + '...' : name
        let extention = $name.slice(index)
    
        let style = { width: '90px', height: '90px', backgroundImage: `url(${url})` }
    
        if (options.type !== 'image') {
          delete style.backgroundImage
          style.background = '#eee'
        }
        return (
            <div key={cpt}
              className="flex flex-column p-2 justify-content-center align-items-center"
              style={style} title={$name}>
              <strong style={{ fontSize: '12px' }} className="block">{options.type !== 'image' ? name + extention : name + extention}</strong>
              {options.size ? <span style={{ fontSize: '8px' }} className="bg-blue-50 mt-2 text-blue-600 px-2 py-1">{options.size}</span>: null}
              <span onClick={()=> options.onAction(f)} className={`mt-2 ${options.actionIcon || 'pi pi-download'} 0  text-xs text-green-500 bg-green-50 hover:bg-red-100 cursor-pointer p-1 border-circle`}></span>
            </div>
          )
    }

    return <div  className='flex gap-5'>
        <a download style={{display: 'none'}} href={current[options.key || 'url']} ref={linkRef} target='_blank' rel='noreferrer'>download</a>
        {files.map( f => render(f))}
    </div>
}

//
