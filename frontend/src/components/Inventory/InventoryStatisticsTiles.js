import React from 'react'
import {Row, Col} from 'react-bootstrap'
import {Card} from 'primereact/card'

const InventoryStatisticsTiles = ({statisticsData, colors}) => {
  const getCardStyle = (color) => ({
    backgroundColor: color,
    color: 'white',
  })

  return (
    <Row className='justify-content-md-center p-3'>
      <Col md='auto'>
        <Card title='Total Items' className='p-mb-2' style={getCardStyle(colors.totalItems)}>
          <p className='h1 text-white'>{statisticsData.totalItems}</p>
        </Card>
      </Col>

      <Col md='auto'>
        <Card
          title='Available Items'
          className='p-mb-2'
          style={getCardStyle(colors.availableItems)}
        >
          <p className='h1 text-white'>{statisticsData.availableItems}</p>
        </Card>
      </Col>

      <Col md='auto'>
        <Card title='Reserved Items' className='p-mb-2' style={getCardStyle(colors.reservedItems)}>
          <p className='h1 text-white'>{statisticsData.reservedItems}</p>
        </Card>
      </Col>
    </Row>
  )
}

export default InventoryStatisticsTiles
