import moment from 'moment'
import { Badge } from 'primereact/badge'
import React from 'react'

function LastSeenComponent({data}) {
  return (
    (!data?.lastSeenAt || typeof data?.lastSeenAt != 'string')  ?  '_' : (
        <div className='flex flex-column'>
            <strong>
                {data.lastSeenAt.includes('+') ? moment(data.lastSeenAt).format('DD/MM/YYYY HH:mm') :
                                                    moment.utc(data.lastSeenAt).format('DD/MM/YYYY HH:mm')}
            </strong>
            <span className='text-sm text-gray-700'>{data.lastSeenLocationName}</span>
            <div className='text-gray-700 text-sm' style={{ fontWeight: 100 }}>{data.lastSeenAddress}</div>
            <div  className='text-sm text-gray-700 font-semibold flex gap-1 align-items-center'>
                <span>{data.lastSeenDevice}</span>
                {data.lastSeenRssi && <Badge  title="force du signal" value={data.lastSeenRssi} severity="warning"></Badge>}
            </div>
        </div>
    )
    
  )
}

export default LastSeenComponent