import { z } from 'zod'

export const widgetSchema = z.object({
  widget_type: z.enum(['text']),
  value: z.string(),
})

export type WidgetValues = z.infer<typeof widgetSchema>
export type CreateWidgetPayload = WidgetValues & { position: number }
export type UpdateWidgetPayload = Pick<WidgetValues, 'value'>
export type Widget = WidgetValues & { id: number; position: number }
