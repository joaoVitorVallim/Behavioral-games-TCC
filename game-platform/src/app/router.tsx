import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { DashboardPage } from '../modules/game-session/pages/DashboardPage'
import { SessionsPage } from '../modules/game-session/pages/SessionsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/DashBoard',
    element: <DashboardPage />,
  },
  {
    path: '/sessions',
    element: <SessionsPage />,
  }
])