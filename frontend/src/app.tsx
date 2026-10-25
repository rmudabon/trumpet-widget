import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Plus } from 'lucide-react'
import { toast } from 'sonner'
import {
  createWidget as createWidgetRequest,
  updateWidget as updateWidgetRequest,
} from './api/widgets'
import { Button } from './components/ui/button'
import { WidgetForm } from './components/widget-form'
import { useWidgets, widgetQueryKey } from './hooks/use-widgets'
import type { UpdateWidgetPayload } from './types/widget'

export function App() {
  const queryClient = useQueryClient()
  const widgetsQuery = useWidgets()
  const widgets = widgetsQuery.data ?? []

  const createWidget = useMutation({
    mutationFn: () =>
      createWidgetRequest({
        widget_type: 'text',
        value: '',
        position: widgets.length + 1,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: widgetQueryKey }),
    onError: (error) => {
      toast.error('Unable to add widget', { description: error.message })
    },
  })
  const updateWidget = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateWidgetPayload }) =>
      updateWidgetRequest(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: widgetQueryKey }),
    onError: (error) => {
      toast.error('Unable to save widget', { description: error.message })
    },
  })

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Your Widgets</h1>
      <ul className="space-y-8">
        {widgets.map((widget) => (
          <li key={widget.id}>
            <WidgetForm
              widget={widget}
              onTextBlur={(value) => updateWidget.mutateAsync({ id: widget.id, values: { value } })}
            />
          </li>
        ))}
      </ul>
      <div className="flex flex-row items-center justify-center">
        <Button
          className="mt-4 cursor-pointer"
          aria-label="Add widget"
          disabled={createWidget.isPending || widgetsQuery.isLoading}
          onClick={() => createWidget.mutate()}
        >
          {createWidget.isPending ? (
            <>
              <LoaderCircle className="animate-spin" />
              Loading
            </>
          ) : (
            <>
              <Plus /> Add Field
            </>
          )}
        </Button>
      </div>
      <footer className="border-border text-muted-foreground mt-12 flex justify-between border-t pt-4 text-[11px]">
        <span>Rowmel Marco Dabon</span>
      </footer>
    </main>
  )
}
