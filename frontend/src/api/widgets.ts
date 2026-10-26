import { StatusCodes } from 'http-status-codes'
import {
  widgetSchema,
  type CreateWidgetPayload,
  type UpdateWidgetPayload,
  type Widget,
} from '../types/widget'

async function request(url: string, requestConfig?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...requestConfig,
    headers: { 'Content-Type': 'application/json', ...requestConfig?.headers },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(body || `Request failed (${response.status})`)
  }

  if (response.status === StatusCodes.NO_CONTENT) return undefined
  return response.json()
}

export async function getWidgets(): Promise<Widget[]> {
  const response = await request('/api/widgets/')
  return widgetSchema.array().parse(response)
}

export async function createWidget(values: CreateWidgetPayload): Promise<Widget> {
  const response = await request('/api/widgets/', {
    method: 'POST',
    body: JSON.stringify(values),
  })
  return widgetSchema.parse(response)
}

export async function updateWidget(id: number, values: UpdateWidgetPayload): Promise<Widget> {
  const response = await request(`/api/widgets/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  })
  return widgetSchema.parse(response)
}

export async function deleteWidget(id: number): Promise<void> {
  await request(`/api/widgets/${id}/`, { method: 'DELETE' })
}
