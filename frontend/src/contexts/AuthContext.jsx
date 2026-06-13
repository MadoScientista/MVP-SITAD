import { createContext, useContext, useState, useCallback } from 'react'
import { api, setTokens, clearToken, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) : null
  })

  const loginCiudadano = useCallback(async (rut) => {
    const data = await api.post('/api/v1/auth/login/ciudadano', { rut })
    setTokens(data.accessToken, data.refreshToken)
    const claims = parseJwt(data.accessToken)
    const userData = { rut: claims.rut, nombre: claims.nombre, rol: claims.rol }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const loginFuncionario = useCallback(async (rut, password) => {
    const data = await api.post('/api/v1/auth/login/funcionario', { rut, password })
    setTokens(data.accessToken, data.refreshToken)
    const claims = parseJwt(data.accessToken)
    const userData = { rut: claims.rut, nombre: claims.nombre, rol: claims.rol }
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (refreshToken) {
      try {
        await api.post('/api/v1/auth/logout', { refreshToken })
      } catch {}
    }
    clearToken()
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  const isAuthenticated = !!user && !!getToken()
  const isFuncionario = user?.rol === 'FUNCIONARIO'
  const isPasajero = user?.rol === 'PASAJERO'

  return (
    <AuthContext.Provider value={{
      user, loginCiudadano, loginFuncionario, logout,
      isAuthenticated, isFuncionario, isPasajero,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const latin1 = atob(base64Url)
    const bytes = Uint8Array.from(latin1, c => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    return {}
  }
}
