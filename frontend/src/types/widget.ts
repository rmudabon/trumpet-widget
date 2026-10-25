import { z } from 'zod'

export const widgetSchema = z.object({
  widget_type: z.enum(['text']),
  value: z.string(),
  position: z.number().int().min(0, 'Position must be zero or greater.'),
})

export type WidgetValues = z.infer<typeof widgetSchema>
export type Widget = WidgetValues & { id: number }
