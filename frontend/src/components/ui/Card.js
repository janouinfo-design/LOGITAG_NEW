import * as React from 'react'
import {cn} from '../../lib/utils'

const Card = React.forwardRef(function Card({className, ...props}, ref) {
  return (
    <div
      ref={ref}
      className={cn('border-1 surface-card text-color shadow-2 border-round', className)}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = React.forwardRef(function CardHeader({className, ...props}, ref) {
  return <div ref={ref} className={cn('flex flex-column gap-2 p-4', className)} {...props} />
})
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef(function CardTitle({className, ...props}, ref) {
  return <h3 ref={ref} className={cn('text-3xl font-bold m-0', className)} {...props} />
})
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef(function CardDescription({className, ...props}, ref) {
  return <p ref={ref} className={cn('text-sm text-color-secondary m-0', className)} {...props} />
})
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef(function CardContent({className, ...props}, ref) {
  return <div ref={ref} className={cn('p-3', className)} {...props} />
})
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef(function CardFooter({className, ...props}, ref) {
  return (
    <div
      ref={ref}
      className={cn('flex align-items-center justify-content-between p-4', className)}
      {...props}
    />
  )
})
CardFooter.displayName = 'CardFooter'

export {Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent}
