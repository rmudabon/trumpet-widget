import { z } from 'zod'

export const widgetSchema = z.object({
  id: z.number().int().positive(),
  widget_type: z.enum(['text']),
  value: z.string(),
  position: z.number().int().nonnegative(),
})

export const widgetFormSchema = widgetSchema.pick({ widget_type: true, value: true })

export type Widget = z.infer<typeof widgetSchema>
export type WidgetValues = z.infer<typeof widgetFormSchema>
export type CreateWidgetPayload = Pick<Widget, 'widget_type' | 'value' | 'position'>
export type UpdateWidgetPayload = Partial<Pick<Widget, 'value'>>
export type DeleteWidgetPayload = Pick<Widget, 'id'>
