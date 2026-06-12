import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ErrorMessage from '../components/ErrorMessage'

export default function LoginFuncionario() {
  const [rut, setRut] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { loginFuncionario } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await loginFuncionario(rut, password)
      navigate('/funcionario/dashboard')
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
        <p className="login-card__subtitle">Acceso Funcionario</p>

        <form onSubmit={handleSubmit}>
          <ErrorMessage message={error} />

          <div className="form-group">
            <label htmlFor="rut">RUT <span className="required">*</span></label>
            <input
              id="rut"
              className="form-input"
              type="text"
              placeholder="11.111.111-1"
              value={rut}
              onChange={(e) => setRut(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contrase&ntilde;a <span className="required">*</span></label>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="Ingrese su contrase&ntilde;a"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn--primary" type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar Sesi&oacute;n'}
          </button>
        </form>

        <div className="login-card__footer">
          <Link to="/login/ciudadano">Acceso ciudadano</Link>
        </div>
      </div>
    </div>
  )
}
