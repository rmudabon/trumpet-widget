import type { CreateWidgetPayload, UpdateWidgetPayload, Widget } from '../types/widget'

async function request<T>(url: string, requestConfig?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...requestConfig,
    headers: { 'Content-Type': 'application/json', ...requestConfig?.headers },
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

export function createWidget(values: CreateWidgetPayload) {
  return request<Widget>('/api/widgets/', {
    method: 'POST',
    body: JSON.stringify(values),
  })
}

export function updateWidget(id: number, values: UpdateWidgetPayload) {
  return request<Widget>(`/api/widgets/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
}

export function deleteWidget(id: number) {
  return request<void>(`/api/widgets/${id}/`, { method: 'DELETE' })
}
