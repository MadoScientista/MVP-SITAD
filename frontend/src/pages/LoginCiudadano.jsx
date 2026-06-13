import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ErrorMessage from '../components/ErrorMessage'

export default function LoginCiudadano() {
  const [rut, setRut] = useState('')
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
      <div className="login-card">
        <div className="login-card__logo">SITAD</div>
        <p className="login-card__subtitle">Acceso Ciudadano</p>

        <form onSubmit={handleSubmit}>
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

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar con ClaveÚnica'}
          </button>
        </form>

        <div className="login-card__footer">
          <Link to="/login/funcionario">Acceso funcionarios</Link>
        </div>
      </div>
    </div>
  )
}
