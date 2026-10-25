import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LoaderCircle, Pencil, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { widgetSchema, type Widget, type WidgetValues } from '../types/widget'

type WidgetFormProps = {
  initial?: Widget
  onCancel?: () => void
  onSave: (values: WidgetValues) => Promise<void>
  busy: boolean
}

export function WidgetForm({ initial, onCancel, onSave, busy }: WidgetFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WidgetValues>({
    resolver: zodResolver(widgetSchema),
    defaultValues: initial
      ? { widget_type: initial.widget_type, value: initial.value }
      : { widget_type: 'text', value: '' },
  })

  async function submit(values: WidgetValues) {
    await onSave(values)
    if (!initial) reset({ widget_type: 'text', value: '' })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <input type="hidden" {...register('widget_type')} />
      <label className="grid gap-2 text-sm font-medium">
        <span>Widget text</span>
        <textarea
          className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:border-destructive min-h-24 resize-y rounded-lg border px-3 py-2 text-sm shadow-xs transition outline-none focus-visible:ring-3"
          placeholder="Write something useful…"
          aria-invalid={Boolean(errors.value)}
          {...register('value')}
        />
        {errors.value && (
          <span className="text-destructive text-xs font-normal">{errors.value.message}</span>
        )}
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : initial ? <Pencil /> : <Plus />}
          {initial ? 'Save changes' : 'Add widget'}
        </Button>
      </div>
    </form>
  )
}
