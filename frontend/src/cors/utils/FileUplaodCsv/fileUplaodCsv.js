import axios from 'axios'

export const uploadFileCsv = async (data) => {
  if (!data.file) return alert('Please select a file!')

  const formData = new FormData()
  formData.append('File', data.file) // Ensure case matches Postman ("File" with capital F)
  formData.append('destination', data.destination)
  formData.append('name', data.name)
  formData.append('orderId', data.orderId)
  formData.append('orderDate', data.orderDate)
  formData.append('desc', data.desc)


  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/file/uploadFile`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('File upload failed!')
  }
}

export const uploadFileFr = async (file) => {
  // uploadFileCsv(data)
  if (!file) return alert('Please select a file!')
  const formData = new FormData()
  formData.append('file', file)
  try {
    const response = await axios.post(
      process.env.REACT_APP_API_URL + 'fileGenerator/readCSVFile',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    if (response?.data?.success) {
      return true
    }
    return false
  } catch (error) {
    console.error('Error uploading file:', error)
    alert('File upload failed!')
  }
}
