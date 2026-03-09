import {InputText} from 'primereact/inputtext'
import {useState} from 'react'

const InputColumnTemp = ({field, filters, setFilters}) => {
  const [localValue, setLocalValue] = useState(filters[field] || '')

  const handleBlur = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: localValue,
    }))
  }

  return (
    <InputText
      type='search'
      placeholder={`${field}`}
      className='p-column-filter border-1 border-blue-300 border-round-lg'
      style={{minWidth: '8rem', maxWidth: '10rem'}}
      name={field}
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur} // Only update main filters on blur
      onFocus={(e) => e.target.select()}
    />
  )
}

export default InputColumnTemp
