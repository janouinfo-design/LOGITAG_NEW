import moment from "moment"

export function formatLastSeen(lastSeenAt) {
    let lastSeenLabel = '-'
    let lastSeenColor = 'gray'
    let diff = null
    if (lastSeenAt) {
      diff = moment().utc().diff(moment(lastSeenAt).utc(), 'days')
      if (diff == 0) {
        lastSeenLabel = "Vu aujourd'hui"
        lastSeenColor = '#47ad53'
      } else if (diff == 1) {
        lastSeenLabel = 'Vu hier'
      } else if (diff < 5) {
        lastSeenLabel = `Vu il y a ${diff} jours`
      } else {
        lastSeenLabel = 'Vu le ' + moment(lastSeenAt).utc().format('DD/MM/YYYY HH:mm')
      }
    }
    return {lastSeenLabel, lastSeenColor, lastSeenAt, dayDiff: diff}
  }