import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getWidgets } from '../api/widgets'

export const widgetQueryKey = ['widgets'] as const

export function useWidgets() {
  return useQuery({
    queryKey: widgetQueryKey,
    queryFn: async () => {
      try {
        return await getWidgets()
      } catch (error) {
        toast.error('Unable to load widgets', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        })
        throw error
      }
    },
    retry: false,
  })
}
