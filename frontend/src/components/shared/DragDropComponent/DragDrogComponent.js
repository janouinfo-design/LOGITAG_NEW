import { memo, useEffect, useState } from 'react'
import { DragDropContext , Draggable , Droppable } from 'react-beautiful-dnd'

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

function DragDrogComponent({items=[] , itemTemplate , droppableId = 'droppedId' , onChange}) {
    const [data , setData] = useState(items) 

    const grid = 8;
    const getItemStyle = (isDragging , draggableStyle)=>({
        // useSelect: 'none',
        // padding: grid*2,
        // margin: `0 0 ${grid}px 0`,
        background: isDragging ? 'purple' : '#fff',
        ...draggableStyle
    })

    const getListStyle = (isDraggingOver)=>({
        background: isDraggingOver ? "lightblue" : "lightblue",
        padding: grid,
    })

    const onDragEnd = (result)=> {
        //dropped outside the list
        if (!result.destination) {
          return;
        }
        
        // const items = reorder(
        //   data,
        //   result.source.index,
        //   result.destination.index
        // );

        // setData(items)

        // if(typeof onChange == 'function')
        //    onChange(items)
  }
  useEffect(()=>{
    setData(items)
  }, [items])
  
  return (
        <Droppable  droppableId={droppableId} type='PLANNINGS'>
          {
            (provided , snapshot)=> (
                <div 
                    {...provided.droppableProps} 
                     ref={provided.innerRef}
                     style={getListStyle(snapshot.isDraggingOver)}
                     >
                      {
                        data.map( (o , index) => (
                            <Draggable  key={o.id} draggableId={`${o.id}`} index={index}>
                                   
                                    {
                                        (provided , snapshot)=>(
                                            <div 
                                                ref={provided.innerRef}
                                                {...provided.draggableProps} 
                                                {...provided.dragHandleProps}
                                                style={getItemStyle(snapshot.isDragging , provided.draggableProps.style)}>
                                               {/* {provided.placeholder} */}
                                               { typeof itemTemplate == 'function' ? 
                                                  itemTemplate(o) :
                                                  null
                                                }

                                                
                                            </div>
                                        )
                                    }
                            </Draggable>
                        ))
                      }
                </div>
            )
          }
        </Droppable>
    // <DragDropContext onDragEnd={onDragEnd}>
    // </DragDropContext>
  )
}

export default memo(DragDrogComponent)