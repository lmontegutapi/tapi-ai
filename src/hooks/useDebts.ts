import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export const useDebts = () => {
  return useQuery({
    queryKey: ['debts'],
    queryFn: async () => {
      const response = await axios.get('/api/debts')
      return response.data
    }
  })
}