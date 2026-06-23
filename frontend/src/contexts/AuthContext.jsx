import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { api, setToken, clearToken, getToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('/api/v1/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setToken(data.accessToken)
          const claims = parseJwt(data.accessToken)
          setUser({ rut: claims.rut, nombre: claims.nombre, rol: claims.rol })
        }
      } catch {}
      setInitializing(false)
    })()
  }, [])

  const loginCiudadano = useCallback(async (rut) => {
    const data = await api.post('/api/v1/auth/login/ciudadano', { rut })
    setToken(data.accessToken)
    const claims = parseJwt(data.accessToken)
    const userData = { rut: claims.rut, nombre: claims.nombre, rol: claims.rol }
    setUser(userData)
    return userData
  }, [])

  const loginFuncionario = useCallback(async (rut, password) => {
    const data = await api.post('/api/v1/auth/login/funcionario', { rut, password })
    setToken(data.accessToken)
    const claims = parseJwt(data.accessToken)
    const userData = { rut: claims.rut, nombre: claims.nombre, rol: claims.rol }
    setUser(userData)
    return userData
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/api/v1/auth/logout')
    } catch {}
    clearToken()
    setUser(null)
  }, [])

  const isAuthenticated = !!user && !!getToken()
  const isFuncionario = user?.rol === 'FUNCIONARIO'
  const isPasajero = user?.rol === 'PASAJERO'

  if (initializing) {
    return null
  }

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
