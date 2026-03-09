import {useState} from 'react'
import {useAppDispatch} from '.'

export const useApi = () => {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const apiCall = async (apiFunction) => {
    try {
      setLoading(true)
      setError(null)
      await dispatch(apiFunction())
    } catch (err) {
      setError(err.message || 'An error occurred') // Customize the error message as needed
    } finally {
      setLoading(false)
    }
  }

  return {loading, error, apiCall}
}
