import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../app'
import { Toaster } from '../components/ui/toast'
import type { Widget } from '../types/widget'

let widgets: Widget[]
let failSave: boolean
let queryClient: QueryClient

// Mock only the network boundary; use the actual API client, forms, queries, and toasts.
const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  widgets = [
    { id: 11, widget_type: 'text', value: 'Saved value A', position: 1 },
    { id: 22, widget_type: 'text', value: 'Saved value B', position: 2 },
  ]
  failSave = false
  queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })

  fetchMock.mockReset()
  fetchMock.mockImplementation(async (url, options) => {
    const method = options?.method ?? 'GET'

    if (url === '/api/widgets/' && method === 'GET') {
      return Response.json(widgets)
    }

    if (url === '/api/widgets/' && method === 'POST') {
      const payload = JSON.parse(String(options?.body)) as Omit<Widget, 'id'>
      widgets = widgets.map((widget) =>
        widget.position >= payload.position ? { ...widget, position: widget.position + 1 } : widget,
      )
      const widget: Widget = { id: 33, ...payload }
      widgets.push(widget)
      widgets.sort((a, b) => a.position - b.position)
      return Response.json(widget, { status: 201 })
    }

    const id = Number(String(url).match(/^\/api\/widgets\/(\d+)\/$/)?.[1])
    const widget = widgets.find((item) => item.id === id)

    if (widget && method === 'PATCH') {
      if (failSave) return new Response('Please try again.', { status: 500 })
      Object.assign(widget, JSON.parse(String(options?.body)))
      return Response.json(widget)
    }

    if (widget && method === 'DELETE') {
      widgets = widgets
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          position: item.position > widget.position ? item.position - 1 : item.position,
        }))
      return new Response(null, { status: 204 })
    }

    throw new Error(`Unexpected request: ${method} ${String(url)}`)
  })
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  queryClient.clear()
})

function renderApp() {
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster timeout={0} />
    </QueryClientProvider>,
  )
  return user
}

function getMutationCalls() {
  return fetchMock.mock.calls.filter(([, options]) => options?.method === 'PATCH')
}

describe('widgets', () => {
  it('renders the fetched widgets with their saved values', async () => {
    renderApp()

    const fields = await screen.findAllByRole('textbox')

    expect(fields).toHaveLength(2)
    expect(screen.getByRole('textbox', { name: 'Text Widget 1' })).toHaveValue('Saved value A')
    expect(screen.getByRole('textbox', { name: 'Text Widget 2' })).toHaveValue('Saved value B')
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets/', expect.any(Object))
  })

  it('adds another widget when Add is clicked', async () => {
    const user = renderApp()
    await screen.findAllByRole('textbox')

    await user.click(screen.getByRole('button', { name: 'Add widget' }))

    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(3))
    expect(screen.getByRole('textbox', { name: 'Text Widget 3' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Text Widget 1' })).toHaveValue('Saved value A')
    expect(screen.getByRole('textbox', { name: 'Text Widget 2' })).toHaveValue('Saved value B')
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widget_type: 'text', value: '', position: 3 }),
    })
  })

  it('inserts a widget after the selected widget and shifts later widgets', async () => {
    const user = renderApp()
    await screen.findAllByRole('textbox')

    expect(screen.getAllByRole('button', { name: /^Insert widget after/ })).toHaveLength(1)
    expect(screen.queryByRole('button', { name: 'Insert widget after 2' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Insert widget after 1' }))

    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(3))
    expect(screen.getByRole('textbox', { name: 'Text Widget 1' })).toHaveValue('Saved value A')
    expect(screen.getByRole('textbox', { name: 'Text Widget 2' })).toHaveValue('')
    expect(screen.getByRole('textbox', { name: 'Text Widget 3' })).toHaveValue('Saved value B')
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widget_type: 'text', value: '', position: 2 }),
    })
  })

  it('can add the first widget to an empty list', async () => {
    widgets = []
    const user = renderApp()
    await screen.findByText('No widgets')

    await user.click(screen.getByRole('button', { name: 'Add widget' }))

    expect(await screen.findByRole('textbox', { name: 'Text Widget 1' })).toHaveValue('')
    expect(screen.getAllByRole('textbox')).toHaveLength(1)
    expect(screen.queryByText('No widgets')).not.toBeInTheDocument()
  })

  it('keeps widget B unchanged when widget A is edited and saved', async () => {
    const user = renderApp()
    const first = await screen.findByRole('textbox', { name: 'Text Widget 1' })
    const second = screen.getByRole('textbox', { name: 'Text Widget 2' })

    await user.clear(first)
    await user.type(first, 'Updated A')
    expect(second).toHaveValue('Saved value B')
    await user.tab()

    await screen.findByText('Changes saved.')
    await waitFor(() => expect(queryClient.isFetching()).toBe(0))
    expect(first).toHaveValue('Updated A')
    expect(second).toHaveValue('Saved value B')
    expect(widgets.find((widget) => widget.id === 22)?.value).toBe('Saved value B')
    expect(getMutationCalls()).toHaveLength(1)
    expect(getMutationCalls()[0][0]).toBe('/api/widgets/11/')
  })

  it('sends the completed value on blur, rather than on each keystroke', async () => {
    const user = renderApp()
    const first = await screen.findByRole('textbox', { name: 'Text Widget 1' })

    await user.clear(first)
    await user.type(first, 'Finished typing')
    expect(getMutationCalls()).toHaveLength(0)

    await user.tab()

    await waitFor(() => expect(getMutationCalls()).toHaveLength(1))
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets/11/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: 'Finished typing' }),
    })
    await screen.findByText('Changes saved.')
  })

  it('shows a save error and preserves unsaved input so the user can retry', async () => {
    failSave = true
    const user = renderApp()
    const first = await screen.findByRole('textbox', { name: 'Text Widget 1' })

    await user.clear(first)
    await user.type(first, 'Unsaved draft')
    await user.tab()

    const notifications = screen.getByRole('region', { name: 'Notifications' })
    expect(
      await within(notifications).findByText('Unable to update widget.', {
        selector: '[data-slot="toast-title"]',
      }),
    ).toBeVisible()
    expect(
      within(notifications).getByText('Please try again.', {
        selector: '[data-slot="toast-description"]',
      }),
    ).toBeVisible()
    expect(first).toHaveValue('Unsaved draft')
    expect(screen.getByRole('textbox', { name: 'Text Widget 2' })).toHaveValue('Saved value B')
    expect(widgets[0].value).toBe('Saved value A')

    failSave = false
    await user.click(first)
    await user.tab()

    await screen.findByText('Changes saved.')
    expect(first).toHaveValue('Unsaved draft')
    expect(widgets[0].value).toBe('Unsaved draft')
    expect(getMutationCalls()).toHaveLength(2)
  })

  it('deletes the intended widget and preserves the other widget', async () => {
    const user = renderApp()
    await screen.findAllByRole('textbox')

    await user.click(screen.getByRole('button', { name: 'Delete Text Widget 1' }))

    await waitFor(() => expect(screen.getAllByRole('textbox')).toHaveLength(1))
    expect(screen.queryByDisplayValue('Saved value A')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Text Widget 1' })).toHaveValue('Saved value B')
    expect(fetchMock).toHaveBeenCalledWith('/api/widgets/11/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
  })
})
