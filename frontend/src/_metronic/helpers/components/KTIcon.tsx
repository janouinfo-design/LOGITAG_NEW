import React from 'react'
import icons from '../icons-config/icons'
import {getLayoutFromLocalStorage} from '../../layout/core'

type Props = {
  className?: string
  iconType?: 'duotone' | 'solid' | 'outline'
  iconName: string
}

const KTIcon: React.FC<Props> = ({className = '', iconType, iconName}) => {
  if (!iconType) {
    iconType = getLayoutFromLocalStorage().main?.iconType
  }

  return (
    <button
      className={`ki-${iconType} ki-${iconName}${
        className && ' ' + className
      } border-0 bg-transparent`}
    >
      {iconType === 'duotone' &&
        [...Array(icons[iconName])].map((e, i) => {
          return (
            <span
              key={`${iconType}-${iconName}-${className}-path-${i + 1}`}
              className={`path${i + 1}`}
            ></span>
          )
        })}
    </button>
  )
}

export {KTIcon}
