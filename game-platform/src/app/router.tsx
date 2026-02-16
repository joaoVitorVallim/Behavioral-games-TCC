import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { SessionsPage } from '../modules/game-session/pages/SessionsPage'
import { CreateSessionPage } from '../modules/game-session/pages/CreateSessionPage'
import { ReportsPage } from '../modules/reports/pages/ReportsPage'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/sessions',
    element: <SessionsPage />,
  },
  {
    path: '/create-session',
    element: (
      <ProtectedRoute>
        <CreateSessionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <ReportsPage />
      </ProtectedRoute>
    ),
  }
])