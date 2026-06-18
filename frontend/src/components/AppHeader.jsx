import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

export default function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth()

  return (
    <>
      <div className="accessibility-bar">
        <button className="accessibility-bar__btn" title="Aumentar tamaño de texto">A+</button>
        <button className="accessibility-bar__btn" title="Disminuir tamaño de texto">A-</button>
        <button className="accessibility-bar__btn" title="Alto contraste">Contraste</button>
      </div>
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__logo">
            <img
              className="site-header__logo-img"
              src="/assets/images/logo-gob.svg"
              alt="Gobierno de Chile"
            />
            <img
              className="site-header__logo-img"
              src="/assets/images/logo-sitad.svg"
              alt="SITAD - Sistema Integrado de Tramitación Aduanera Digital"
            />
          </div>
          {isAuthenticated && (
            <>
              <nav className="site-nav">
                {user?.rol === 'PASAJERO' && (
                  <>
                    <Link className="site-nav__link" to="/ciudadano/dashboard">Inicio</Link>
                    <Link className="site-nav__link" to="/ciudadano/vehiculos">Mis Vehículos</Link>
                    <Link className="site-nav__link" to="/ciudadano/solicitudes/nueva">Solicitar Salida</Link>
                    <Link className="site-nav__link" to="/ciudadano/solicitudes">Consultar Estado</Link>
                  </>
                )}
                {user?.rol === 'FUNCIONARIO' && (
                  <>
                    <Link className="site-nav__link" to="/funcionario/dashboard">Inicio</Link>
                    <Link className="site-nav__link" to="/funcionario/fiscalizacion">Fiscalización</Link>
                  </>
                )}
              </nav>
              <div className="site-header__user">
                <span>{user?.nombre}</span>
                <button className="btn btn--sm btn--secondary" onClick={logout}>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  )
}
