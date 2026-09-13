import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './app/providers/AuthProvider'
import { QueryProvider } from './app/providers/QueryProvider'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { router } from './app/router'
import './index.css'

const root_element = document.getElementById('root')
if (!root_element) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>.')
}

ReactDOM.createRoot(root_element).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)