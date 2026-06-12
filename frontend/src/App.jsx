import { Navigate, Routes, Route, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import AppHeader from './components/AppHeader'
import AppFooter from './components/AppFooter'
import LoginCiudadano from './pages/LoginCiudadano'
import LoginFuncionario from './pages/LoginFuncionario'
import DashboardCiudadano from './pages/DashboardCiudadano'
import DashboardFuncionario from './pages/DashboardFuncionario'
import RegistrarVehiculo from './pages/RegistrarVehiculo'
import SolicitarSalida from './pages/SolicitarSalida'
import ConsultarEstado from './pages/ConsultarEstado'
import Fiscalizacion from './pages/Fiscalizacion'

function Layout() {
  return (
    <div className="app-layout">
      <AppHeader />
      <main className="app-main">
        <Outlet />
      </main>
      <AppFooter />
    </div>
  )
}

function GuestRoute({ children }) {
  const { isAuthenticated, isFuncionario, isPasajero } = useAuth()
  if (!isAuthenticated) return children
  if (isFuncionario) return <Navigate to="/funcionario/dashboard" replace />
  if (isPasajero) return <Navigate to="/ciudadano/dashboard" replace />
  return children
}

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login/ciudadano" replace />
  if (roles && !roles.includes(user?.rol)) {
    if (user?.rol === 'FUNCIONARIO') return <Navigate to="/funcionario/dashboard" replace />
    return <Navigate to="/ciudadano/dashboard" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/login/ciudadano" replace />} />

        <Route path="/login/ciudadano" element={<GuestRoute><LoginCiudadano /></GuestRoute>} />
        <Route path="/login/funcionario" element={<GuestRoute><LoginFuncionario /></GuestRoute>} />

        <Route path="/ciudadano/dashboard" element={<ProtectedRoute roles={['PASAJERO']}><DashboardCiudadano /></ProtectedRoute>} />
        <Route path="/ciudadano/vehiculos/registrar" element={<ProtectedRoute roles={['PASAJERO']}><RegistrarVehiculo /></ProtectedRoute>} />
        <Route path="/ciudadano/solicitudes/nueva" element={<ProtectedRoute roles={['PASAJERO']}><SolicitarSalida /></ProtectedRoute>} />
        <Route path="/ciudadano/solicitudes" element={<ProtectedRoute roles={['PASAJERO']}><ConsultarEstado /></ProtectedRoute>} />

        <Route path="/funcionario/dashboard" element={<ProtectedRoute roles={['FUNCIONARIO']}><DashboardFuncionario /></ProtectedRoute>} />
        <Route path="/funcionario/fiscalizacion" element={<ProtectedRoute roles={['FUNCIONARIO']}><Fiscalizacion /></ProtectedRoute>} />

        <Route path="*" element={
          <div className="page-container text-center" style={{ paddingTop: 80 }}>
            <h2>404 — P&aacute;gina no encontrada</h2>
            <a href="/login/ciudadano">Volver al inicio</a>
          </div>
        } />
      </Route>
    </Routes>
  )
}
