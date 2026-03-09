import {useState, useEffect} from 'react'
import {Dropdown} from 'primereact/dropdown'
import {OlangItem} from '../Olang/user-interface/OlangItem/OlangItem'

const IconDropdown = ({
  data = [],
  selectedIcon,
  setSelectedIcon,
  filter,
  filterBy,
  className,
  onChange,
  optionValue,
  name,
  value,
  id,
}) => {
  const [iconOptions, setIconOptions] = useState([])

  const optionTemplate = (option) => {
    return (
      <div className='flex'>
        <i className={`${option?.name} text-2xl`} />

        <span className='ml-2'>{option?.name}</span>
      </div>
    )
  }

  useEffect(() => {
    setIconOptions([
      ...data?.map((typ, index) => ({
        name: typ.icon,
        code: index,
      })),
    ])
  }, [data])

  return (
    <div>
      <label>
        <OlangItem olang={'famille.icon'} />{' '}
      </label>
      <div>
        <Dropdown
          id={id}
          name={name}
          filter={filter}
          filterBy={filterBy}
          value={value}
          className={className}
          onChange={onChange}
          optionLabel={(option) => optionTemplate(option)}
          optionValue={optionValue}
          placeholder='Select an icon'
          options={iconOptions}
          itemTemplate={optionTemplate}
        />
      </div>
    </div>
  )
}

export default IconDropdown
