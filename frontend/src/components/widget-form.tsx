import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Textarea } from './ui/textarea'
import { widgetFormSchema, type Widget, type WidgetValues } from '../types/widget'

type WidgetFormProps = {
  widget: Widget
  onTextBlur: (value: string) => Promise<unknown>
}

export function WidgetForm({ widget, onTextBlur }: WidgetFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WidgetValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: { widget_type: widget.widget_type, value: widget.value },
  })

  const saveOnBlur = handleSubmit(async ({ value }) => {
    if (value !== widget.value) await onTextBlur(value)
  })

  return (
    <div className="border-input bg-card rounded-lg border px-4 py-3 shadow-xs">
      <h2 className="text-foreground mb-4 text-sm font-medium">
        Text Widget {widget.position + 1}
      </h2>
      <Textarea
        className="min-h-16 resize-y"
        aria-label={`Text Widget ${widget.position}`}
        aria-invalid={Boolean(errors.value)}
        {...register('value')}
        onBlur={saveOnBlur}
        rows={8}
      />
    </div>
  )
}
