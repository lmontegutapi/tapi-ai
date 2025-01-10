import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export function useReceivables(contactId: string) {
  return useQuery({
    queryKey: ['receivables', contactId],
    queryFn: async () => {
      const { data } = await axios.get(`/api/receivables/${contactId}`);
      return data;
    }
  });
}