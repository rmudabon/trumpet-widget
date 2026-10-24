import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'

type Status = 'loading' | 'healthy' | 'unavailable'

function App() {
  const [status, setStatus] = useState<Status>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 10000)
    let active = true
    setStatus('loading')

    async function checkHealth() {
      try {
        const response = await fetch('/api/health/', { signal: controller.signal })
        const data: unknown = await response.json()
        const healthy = response.ok && typeof data === 'object' && data !== null
          && 'status' in data && data.status === 'ok'
          && 'database' in data && data.database === 'ok'
        if (active) setStatus(healthy ? 'healthy' : 'unavailable')
      } catch {
        if (active) setStatus('unavailable')
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void checkHealth()
    return () => {
      active = false
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [attempt])

  return (
    <main>
      <p className="eyebrow">Development environment</p>
      <h1>Trumpet Widget</h1>
      <p>React + Django REST Framework + PostgreSQL</p>
      <section aria-live="polite" aria-busy={status === 'loading'}>
        <span className={`indicator ${status}`} aria-hidden="true" />
        {status === 'loading' && 'Checking API and database…'}
        {status === 'healthy' && 'API and database are connected.'}
        {status === 'unavailable' && 'API or database is unavailable. Try again.'}
      </section>
      <button disabled={status === 'loading'} onClick={() => setAttempt((value) => value + 1)}>
        Check again
      </button>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
