import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '../modules/auth/pages/HomePage'
import { LoginPage } from '../modules/auth/pages/LoginPage'
import { RegisterPage } from '../modules/auth/pages/RegisterPage'
import { SessionsPage } from '../modules/game-session/pages/SessionsPage'
import { CreateSessionPage } from '../modules/game-session/pages/CreateSessionPage'
import { ReportsPage } from '../modules/reports/pages/ReportsPage'
import { SessionMatchesPage } from '../modules/reports/pages/SessionMatchesPage'
import { MatchDetailPage } from '../modules/reports/pages/MatchDetailPage'
import { WaitingPage } from '../modules/prisoner/pages/WaitingPage'
import { GamePage } from '../modules/prisoner/pages/GamePage'
import { ResultPage } from '../modules/prisoner/pages/ResultPage'
import { RouletteGamePage } from '../modules/roulette/pages/RouletteGamePage'
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
  },
  {
    path: '/reports/:sessionId',
    element: (
      <ProtectedRoute>
        <SessionMatchesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports/:sessionId/matches/:matchId',
    element: (
      <ProtectedRoute>
        <MatchDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/prisoner/waiting',
    element: <WaitingPage />,
  },
  {
    path: '/prisoner/game',
    element: <GamePage />,
  },
  {
    path: '/prisoner/result',
    element: <ResultPage />,
  },
  {
    path: '/roulette/game',
    element: <RouletteGamePage />,
  },
])
