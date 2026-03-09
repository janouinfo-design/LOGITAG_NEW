import moment from 'moment'

export const formateDate = (date) => {
  if (!date || typeof date != 'string') return '_'
  if (date.includes('+')) return moment(date).format('DD/MM/YYYY HH:mm')
  return moment.utc(date).format('DD/MM/YYYY HH:mm')
}
