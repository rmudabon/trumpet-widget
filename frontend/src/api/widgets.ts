import type { Widget, WidgetValues } from '../types/widget'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed (${response.status})`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function getWidgets() {
  return request<Widget[]>('/api/widgets/')
}

export function createWidget(values: WidgetValues) {
  return request<Widget>('/api/widgets/', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateWidget(id: number, values: WidgetValues) {
  return request<Widget>(`/api/widgets/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(values),
  })
}

export function deleteWidget(id: number) {
  return request<void>(`/api/widgets/${id}/`, { method: 'DELETE' })
}
