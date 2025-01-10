import { useQuery } from '@tanstack/react-query';
import { getOrganizationSettings } from '@/actions/settings';

export function useOrganizationSettings() {
  return useQuery({
    queryKey: ['organizationSettings'],
    queryFn: async () => {
      const response = await getOrganizationSettings();
      if (!response.success) {
        throw new Error('Error al obtener la configuración');
      }
      return response.data;
    }
  });
}