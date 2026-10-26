import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Plus } from 'lucide-react'
import { toast } from './components/ui/toast'
import {
  createWidget as createWidgetRequest,
  updateWidget as updateWidgetRequest,
} from './api/widgets'
import { Button } from './components/ui/button'
import { WidgetForm } from './components/widget-form'
import { useWidgets, widgetQueryKey } from './hooks/use-widgets'
import type { UpdateWidgetPayload } from './types/widget'
import { Skeleton } from './components/ui/skeleton'

export function App() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useWidgets()
  const widgets = data ?? []

  const createWidget = useMutation({
    mutationFn: (position: number) =>
      createWidgetRequest({
        widget_type: 'text',
        value: '',
        position,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: widgetQueryKey })
    },
    onError: (error) => {
      toast.add({
        title: 'Unable to add widget',
        description: error.message,
        type: 'error',
        priority: 'high',
      })
    },
  })
  const updateWidget = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateWidgetPayload }) =>
      updateWidgetRequest(id, values),
    onSuccess: () => {
      toast.add({
        title: 'Changes saved.',
        type: 'success',
      })
      queryClient.invalidateQueries({ queryKey: widgetQueryKey })
    },
    onError: (error) => {
      toast.add({
        title: 'Unable to update widget.',
        description: error.message,
        type: 'error',
        priority: 'high',
      })
    },
  })

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Your Widgets</h1>
      {isLoading && <Skeleton className="h-32 w-full rounded-lg" />}
      {!isLoading && widgets.length === 0 && (
        <section className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8">
          <h2 className="text-xl font-semibold">No widgets</h2>
          <p className="text-secondary-foreground mt-1">Add one to get started.</p>
          <Button
            className="my-8 cursor-pointer"
            aria-label="Add widget"
            disabled={createWidget.isPending || isLoading}
            onClick={() => createWidget.mutate(1)}
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
        </section>
      )}
      {!isLoading && widgets.length > 0 && (
        <section>
          <ul className="space-y-8">
            {widgets.map((widget, index) => (
              <li key={widget.id}>
                <WidgetForm
                  widget={widget}
                  canInsertAfter={index < widgets.length - 1}
                  onInsertAfter={() => createWidget.mutate(widget.position + 1)}
                  onTextBlur={(value) =>
                    updateWidget.mutateAsync({ id: widget.id, values: { value } })
                  }
                />
              </li>
            ))}
          </ul>
          <div className="flex flex-row items-center justify-center">
            <Button
              className="mt-4 cursor-pointer"
              aria-label="Add widget"
              disabled={createWidget.isPending || isLoading}
              onClick={() => createWidget.mutate(widgets.length + 1)}
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
        </section>
      )}
      <footer className="border-border text-muted-foreground mt-12 flex justify-between border-t pt-4 text-[11px]">
        <span>Rowmel Marco Dabon</span>
      </footer>
    </main>
  )
}
