import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/game-session/pages/DashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  }
])