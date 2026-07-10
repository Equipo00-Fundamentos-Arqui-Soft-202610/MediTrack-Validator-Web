import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { setOnUnauthorized } from './api/httpClient'

/// Registra el hook de 401 (limpia sesión y vuelve a Login) — mismo patrón
/// que ApiClient.onUnauthorized en MediTrack-Mobile.
function UnauthorizedHandler() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    setOnUnauthorized(() => {
      logout()
      navigate('/login')
    })
  }, [logout, navigate])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UnauthorizedHandler />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
