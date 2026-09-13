import { AlertTriangle } from 'lucide-react'

interface ErrorScreenProps {
  title: string
  message: string
  action_label: string
  onAction: () => void
}

/**
 * The one full-page error screen for the app — originally built as
 * ErrorBoundary's render-error fallback, extracted here so the same look is
 * the standard for every full-page error state (render errors, 404s, ...)
 * instead of each one inventing its own.
 */
export function ErrorScreen({ title, message, action_label, onAction }: ErrorScreenProps) {
  return (
    <div className="app-shell flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="surface-panel max-w-md p-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-destructive/40 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">{title}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{message}</p>
        <button type="button" onClick={onAction} className="btn-primary w-full">
          {action_label}
        </button>
      </div>
    </div>
  )
}
