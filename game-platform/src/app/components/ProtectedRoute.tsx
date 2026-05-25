import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../modules/auth/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { is_authenticated, is_loading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (is_loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!is_authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // Render protected content if authenticated
  return <>{children}</>
}
