import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Textarea } from './ui/textarea'
import { widgetFormSchema, type Widget, type WidgetValues } from '../types/widget'
import { deleteWidget as deleteWidgetRequest } from '@/api/widgets'
import { Button } from './ui/button'
import { X } from 'lucide-react'

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
    if (value === widget.value) return
    try {
      await onTextBlur(value)
    } catch {
      // The mutation shows the error toast. Keep the draft available for retry.
    }
  })

  const queryClient = useQueryClient()
  const deleteWidget = useMutation({
    mutationFn: (id: number) => deleteWidgetRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets'] }),
  })

  return (
    <div className="border-input bg-card rounded-lg border px-4 py-3 shadow-xs">
      <div className="mb-4 flex flex-row items-center justify-between">
        <h2 className="text-foreground text-sm font-medium">Text Widget {widget.position}</h2>
        <Button
          aria-label={`Delete Text Widget ${widget.position}`}
          className="cursor-pointer"
          disabled={deleteWidget.isPending}
          variant="destructive"
          size="icon"
          onClick={() => deleteWidget.mutate(widget.id)}
        >
          <X />
        </Button>
      </div>
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
