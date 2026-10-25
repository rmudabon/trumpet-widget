import { useQuery } from '@tanstack/react-query'
import { toast } from '../components/ui/toast'
import { getWidgets } from '../api/widgets'

export const widgetQueryKey = ['widgets'] as const

export function useWidgets() {
  return useQuery({
    queryKey: widgetQueryKey,
    queryFn: async () => {
      try {
        return await getWidgets()
      } catch (error) {
        toast.add({
          title: 'Unable to load widgets',
          description: error instanceof Error ? error.message : 'An unexpected error occurred.',
          type: 'error',
          priority: 'high',
        })
        throw error
      }
    },
    retry: false,
  })
}
