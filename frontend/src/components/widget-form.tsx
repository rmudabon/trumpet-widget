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
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WidgetValues>({
    resolver: zodResolver(widgetSchema),
    defaultValues: initial ?? { widget_type: 'text', value: '', position: 0 },
  })

  async function submit(values: WidgetValues) {
    await onSave(values)
    if (!initial) reset({ widget_type: 'text', value: '', position: 0 })
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
      <input type="hidden" {...register('widget_type')} />
      <label className="grid gap-2 text-sm font-medium">
        <span>Widget text</span>
        <textarea
          className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
          placeholder="Write something useful…"
          aria-invalid={Boolean(errors.value)}
          {...register('value')}
        />
        {errors.value && <span className="text-xs font-normal text-destructive">{errors.value.message}</span>}
      </label>
      <label className="grid max-w-32 gap-2 text-sm font-medium">
        <span>Position</span>
        <input
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 aria-invalid:border-destructive"
          type="number"
          min={0}
          aria-invalid={Boolean(errors.position)}
          {...register('position', { valueAsNumber: true })}
        />
        {errors.position && <span className="text-xs font-normal text-destructive">{errors.position.message}</span>}
      </label>
      <div className="flex justify-end gap-2">
        {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : initial ? <Pencil /> : <Plus />}
          {initial ? 'Save changes' : 'Add widget'}
        </Button>
      </div>
    </form>
  )
}
