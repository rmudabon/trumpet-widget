import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Activity, LoaderCircle, Pencil, Plus, RefreshCw, Shapes, Trash2, X } from 'lucide-react'
import { Button } from './components/ui/button'
import {
  createWidget as createWidgetRequest,
  deleteWidget as deleteWidgetRequest,
  getWidgets,
  updateWidget as updateWidgetRequest,
} from './api/widgets'
import { WidgetForm } from './components/widget-form'
import type { WidgetValues } from './types/widget'

export function App() {
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const widgetsQuery = useQuery({
    queryKey: ['widgets'],
    queryFn: getWidgets,
  })

  const createWidget = useMutation({
    mutationFn: (values: WidgetValues) => createWidgetRequest(values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets'] }),
  })
  const updateWidget = useMutation({
    mutationFn: ({ id, values }: { id: number; values: WidgetValues }) =>
      updateWidgetRequest(id, values),
    onSuccess: () => {
      setEditingId(null)
      void queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })
  const deleteWidget = useMutation({
    mutationFn: deleteWidgetRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets'] }),
  })
  const widgets = widgetsQuery.data ?? []
  const mutationError = createWidget.error ?? updateWidget.error ?? deleteWidget.error

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <header className="border-border mb-10 flex items-center justify-between border-b pb-5">
        <a
          className="text-foreground flex items-center gap-2 font-semibold tracking-tight no-underline"
          href="#"
        >
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-lg">
            <Shapes className="size-4" />
          </span>
          trumpet<span className="text-primary -ml-2">.</span>
        </a>
        <div className="text-muted-foreground flex items-center gap-2 text-xs" aria-live="polite">
          <span
            className={`size-2 rounded-full ${widgetsQuery.isError ? 'bg-destructive' : widgetsQuery.isLoading ? 'animate-pulse bg-amber-500' : 'bg-emerald-600'}`}
          />
          {widgetsQuery.isError
            ? 'API unavailable'
            : widgetsQuery.isLoading
              ? 'Connecting'
              : 'API connected'}
        </div>
      </header>

      <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-primary mb-2 flex items-center gap-2 text-xs font-semibold tracking-[.14em] uppercase">
            <Activity className="size-3.5" /> Workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your widgets</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Create and organize the content in your widget feed.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => void widgetsQuery.refetch()}
            disabled={widgetsQuery.isFetching}
          >
            <RefreshCw className={widgetsQuery.isFetching ? 'animate-spin' : ''} /> Refresh
          </Button>
          <Button
            onClick={() => {
              setShowCreate((value) => !value)
              createWidget.reset()
            }}
          >
            {showCreate ? <X /> : <Plus />} {showCreate ? 'Close' : 'Add widget'}
          </Button>
        </div>
      </section>

      {showCreate && (
        <section
          className="border-border bg-card mb-8 rounded-xl border p-5 shadow-sm sm:p-6"
          aria-labelledby="add-widget-title"
        >
          <h2 id="add-widget-title" className="mb-1 text-base font-semibold">
            New widget
          </h2>
          <p className="text-muted-foreground mb-5 text-sm">
            Add text to your feed and choose its display position.
          </p>
          <WidgetForm
            onSave={async (values) => {
              await createWidget.mutateAsync(values)
            }}
            busy={createWidget.isPending}
          />
          {createWidget.error && (
            <p className="text-destructive mt-4 text-sm" role="alert">
              {createWidget.error.message}
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="widget-list-title">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="widget-list-title" className="text-base font-semibold">
              All widgets
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Your feed content, in display order.
            </p>
          </div>
          <span className="border-border bg-card text-muted-foreground rounded-full border px-3 py-1 text-xs">
            {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'}
          </span>
        </div>

        {mutationError && (
          <div
            className="border-destructive/30 bg-destructive/5 text-destructive mb-3 rounded-lg border p-3 text-sm"
            role="alert"
          >
            {mutationError.message}
          </div>
        )}
        {widgetsQuery.isLoading ? (
          <div className="border-border bg-card text-muted-foreground flex min-h-48 items-center justify-center gap-2 rounded-xl border text-sm">
            <LoaderCircle className="size-4 animate-spin" /> Loading widgets…
          </div>
        ) : widgetsQuery.isError ? (
          <div className="border-border bg-card flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border p-6 text-center">
            <p className="text-muted-foreground max-w-sm text-sm">
              Could not load widgets. Check that the API is running, then try again.
            </p>
            <Button variant="outline" onClick={() => void widgetsQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : widgets.length === 0 ? (
          <div className="border-border bg-card flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
            <span className="bg-muted text-muted-foreground mb-3 grid size-11 place-items-center rounded-xl">
              <Shapes className="size-5" />
            </span>
            <h3 className="text-sm font-semibold">No widgets yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-xs">
              Add your first widget to start building your feed.
            </p>
            {!showCreate && (
              <Button className="mt-4" size="sm" onClick={() => setShowCreate(true)}>
                <Plus /> Add widget
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {widgets.map((widget) => (
              <article
                key={widget.id}
                className="border-border bg-card rounded-xl border p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
              >
                {editingId === widget.id ? (
                  <>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Edit widget</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Close edit"
                        onClick={() => setEditingId(null)}
                      >
                        <X />
                      </Button>
                    </div>
                    <WidgetForm
                      initial={widget}
                      onCancel={() => setEditingId(null)}
                      onSave={async (values) => {
                        await updateWidget.mutateAsync({ id: widget.id, values })
                      }}
                      busy={updateWidget.isPending}
                    />
                    {updateWidget.error && (
                      <p className="text-destructive mt-3 text-sm" role="alert">
                        {updateWidget.error.message}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg text-xs font-semibold">
                        {String(widget.position + 1).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="text-muted-foreground mb-1 text-[11px]">
                          <span className="text-primary font-semibold capitalize">
                            {widget.widget_type}
                          </span>
                          <span className="text-border px-2">·</span>Widget #{widget.id}
                        </p>
                        <p className="text-foreground text-sm leading-6 break-words whitespace-pre-wrap">
                          {widget.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit widget ${widget.id}`}
                        onClick={() => {
                          setEditingId(widget.id)
                          updateWidget.reset()
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete widget ${widget.id}`}
                        disabled={deleteWidget.isPending}
                        onClick={() => deleteWidget.mutate(widget.id)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="border-border text-muted-foreground mt-12 flex justify-between border-t pt-4 text-[11px]">
        <span>Trumpet Widget</span>
        <span>Workspace content</span>
      </footer>
    </main>
  )
}
