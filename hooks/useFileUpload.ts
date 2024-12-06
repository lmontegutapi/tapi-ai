import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useFileUpload = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData()
      files.forEach(file => formData.append('files', file))
      
      const response = await fetch('/api/upload-debts', {
        method: 'POST',
        body: formData
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    }
  })
}