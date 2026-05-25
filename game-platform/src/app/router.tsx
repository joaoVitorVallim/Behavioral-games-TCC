import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../modules/auth/pages/HomePage'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { RegisterPage } from '../modules/auth/pages/RegisterPage'
import { SessionsPage } from '../modules/game-session/pages/SessionsPage'
import { CreateSessionPage } from '../modules/game-session/pages/CreateSessionPage'
import { ReportsPage } from '../modules/reports/pages/ReportsPage'
import { ProtectedRoute } from './components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
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
