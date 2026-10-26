import { LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'

type WidgetFetchErrorProps = {
  isRetrying: boolean
  onRetry: () => void
}

export function WidgetFetchError({ isRetrying, onRetry }: WidgetFetchErrorProps) {
  return (
    <section role="alert" className="flex flex-col items-center gap-3 rounded-lg border p-8">
      <h2 className="text-lg font-semibold">Unable to load widgets</h2>
      <p className="text-secondary-foreground">Check your connection and try again.</p>
      <Button onClick={onRetry} disabled={isRetrying}>
        {isRetrying && <LoaderCircle className="animate-spin" />}
        {isRetrying ? 'Retrying...' : 'Retry'}
      </Button>
    </section>
  )
}
