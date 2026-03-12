import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './app/providers/AuthProvider'
import { QueryProvider } from './app/providers/QueryProvider'
import { router } from './app/router'
import './index.css'

const root_element = document.getElementById('root')
if (!root_element) {
  throw new Error('Root element not found. Ensure index.html contains <div id="root"></div>.')
}

ReactDOM.createRoot(root_element).render(
  <React.StrictMode>
    <AuthProvider>
      <QueryProvider>
        <RouterProvider router={router} />
      </QueryProvider>
    </AuthProvider>
  </React.StrictMode>,
)