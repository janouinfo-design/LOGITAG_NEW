import  { Card } from 'primereact/card'
import { Carousel } from 'primereact/carousel'
import DragDrogComponent from '../../shared/DragDropComponent/DragDrogComponent'
import { DragDropContext } from 'react-beautiful-dnd'
import { useState } from 'react'
import _ from 'lodash'

function PlanningList() {
  const [plannings , setPlannings] = useState(Array.from({length: 8} , (c, index)=> {
     return {
        id: index+1,
        note: `Note ${index+1}`,
        date: '25/07/2023',
        stops: Array.from( { length: 10 } , (c , _i)=> {
            return  {
                id: _i + 1 + (index + 1)* 100,
                address: `${_i + 1} rue George Washington, Melton , Suisse`
            }
        })
     }
  })) 

  

  const itemTemplate = (r)=> 
        <div  className='shadow-1 p-4 bg-white my-2'>
                <h4>Order #{r.id}</h4>
                <div>
                    <i className='pi pi-map-marker'></i> {r.address}
                </div>
        </div>
  
  const template = (data)=> <div className='border-1 border-gray-100'>
    <div style={{height: '200px'}} className='bg-gray-700 text-white p-2'>
         <h1 className='text-white'>Planning #{data.id}</h1>
    </div>
    <div className='bg-white'>
      <DragDrogComponent items={data.stops} itemTemplate={itemTemplate} droppableId={`${data.id}`} />
    </div>
  </div>

  const responsiveOptions = [
    {
        breakpoint: '1024px',
        numVisible: 4,
        numScroll: 4
    },
    {
        breakpoint: '760px',
        numVisible: 3,
        numScroll: 3
    },
    {
        breakpoint: '580px',
        numVisible: 1,
        numScroll: 1
    }
  ];

  const onDragEnd = (result)=> {
      //dropped outside the list
      if (!result.destination) {
        return;
      }

      const { source , destination } = result;

      const srcId = source.droppableId
      const destId = destination.droppableId

      let data = _.cloneDeep(plannings);

      let dt = data.find( p => p.id == srcId).stops.find( ( o , index)=> index == source.index);

      data.forEach( t => {
         if(t.id == srcId){
          t.stops.splice(source.index, 1)
         }
         if(t.id == destId) t.stops.splice(destination.index, 0, dt)
      })
      

      setPlannings(data)

      


  }
  
  return (
    <div className='planning-items-container'>
      <DragDropContext  onDragEnd={onDragEnd}>
        <Card className='card'>
            <Carousel 
                numVisible={4}
                numScroll={4}
                value={plannings}
                itemTemplate={template}
                responsiveOptions={responsiveOptions}
                />
         </Card>
      </DragDropContext>
        
    </div>
  )
}

export default PlanningList