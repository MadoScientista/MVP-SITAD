import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ErrorMessage from '../components/ErrorMessage'

export default function LoginCiudadano() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginCiudadano } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginCiudadano(rut)
      navigate('/ciudadano/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className={`login-card${loading ? ' login-card--loading' : ''}`} role="main">

        <div className="login-card__service-identity">
          <h1 className="login-card__service-name">SITAD</h1>
          <p className="login-card__service-description">
            Sistema Integrado de Tramitación Aduanera Digital
          </p>
        </div>

        <hr className="login-card__divider" aria-hidden="true" />

        <div className="login-card__cta">
          <p className="login-card__instruction">
            Inicia sesión con tu <strong className="text-claveunica">ClaveÚnica</strong>
          </p>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <ErrorMessage message={error} />

            <div className="form-group">
              <label htmlFor="rut">RUT <span className="required">*</span></label>
              <input
                id="rut"
                className="form-input"
                type="text"
                placeholder="12.345.678-5"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña <span className="required">*</span></label>
              <input
                id="password"
                className="form-input"
                type="password"
                placeholder="Ingresa tu ClaveÚnica"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              className="btn-cu btn-m btn-color-estandar btn-fw rounded-middle"
              type="submit"
              disabled={loading}
              aria-label="Iniciar sesión con ClaveÚnica"
            >
              <span className="cl-claveunica" aria-hidden="true"></span>
              <span className="texto" aria-hidden="true">
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </span>
            </button>
          </form>

          <p className="login-card__help-text">
            ¿No tienes ClaveÚnica?{' '}
            <a
              className="login-card__help-link"
              href="https://claveunica.gob.cl/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Solicítala aquí
            </a>
          </p>
        </div>

        <div className="login-card__footer">
          <Link to="/login/funcionario">Acceso funcionarios</Link>
        </div>
      </div>

    </div>
  )
}
