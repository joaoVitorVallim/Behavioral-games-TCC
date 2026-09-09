import type { ToastState } from '../hooks/useToast'

/**
 * Renders the toast markup duplicated between CreateSessionPage and
 * SessionsPage. Pass the `toast` state from useToast(); renders nothing when null.
 */
export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div
        className={`min-w-64 max-w-sm rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm ${
          toast.type === 'success'
            ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-100'
            : 'border-destructive/40 bg-destructive/20 text-red-100'
        }`}
        role="status"
        aria-live="polite"
      >
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
    </div>
  )
}
