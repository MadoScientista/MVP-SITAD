import { useAuth } from '../contexts/AuthContext'

export default function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <span>SITAD</span>
        <small style={{ opacity: 0.8, fontWeight: 400 }}>
          Sistema Integrado de Tramitaci&oacute;n Aduanera Digital
        </small>
      </div>
      <div className="app-header__user">
        <span>{user?.nombre}</span>
        <button className="btn btn--sm" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }} onClick={logout}>
          Cerrar sesi&oacute;n
        </button>
      </div>
    </header>
  )
}
