import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import FormSection from '../components/FormSection'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

export default function SolicitarSalida() {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [form, setForm] = useState({ vehiculoId: '', fechaSalida: '', fechaRetorno: '', paisDestino: 'Argentina', pasoFronterizo: 'Los Libertadores' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingVehiculos, setLoadingVehiculos] = useState(true)

  useEffect(() => {
    api.get('/api/v1/vehicular/vehiculos')
      .then((v) => {
        setVehiculos(v)
        if (v.length > 0) setForm((f) => ({ ...f, vehiculoId: v[0].id }))
      })
      .catch(() => {})
      .finally(() => setLoadingVehiculos(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/v1/vehicular/solicitudes', {
        vehiculoId: parseInt(form.vehiculoId, 10),
        fechaSalida: form.fechaSalida,
        fechaRetorno: form.fechaRetorno,
        paisDestino: form.paisDestino,
        pasoFronterizo: form.pasoFronterizo,
      })
      navigate('/ciudadano/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingVehiculos) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Nueva solicitud' },
      ]} />
      <PageTitle title="Solicitar salida temporal" subtitle="Complete los datos del viaje" />

      <form onSubmit={handleSubmit}>
        <SectionCard title="Datos del viaje">
          <ErrorMessage message={error} />

          <FormSection>
            <div className="form-group">
              <label htmlFor="vehiculoId">Vehículo <span className="required">*</span></label>
              <select id="vehiculoId" name="vehiculoId" className="form-select" value={form.vehiculoId} onChange={handleChange} required>
                {vehiculos.length === 0 && <option value="">No hay vehículos registrados</option>}
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.patente} - {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="fechaSalida">Fecha de salida <span className="required">*</span></label>
              <input id="fechaSalida" name="fechaSalida" className="form-input" type="date" value={form.fechaSalida} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaRetorno">Fecha de retorno <span className="required">*</span></label>
              <input id="fechaRetorno" name="fechaRetorno" className="form-input" type="date" value={form.fechaRetorno} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="paisDestino">País de destino <span className="required">*</span></label>
              <select id="paisDestino" name="paisDestino" className="form-select" value={form.paisDestino} onChange={handleChange} required>
                <option value="Argentina">Argentina</option>
                <option value="Perú">Perú</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Brasil">Brasil</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pasoFronterizo">Paso fronterizo <span className="required">*</span></label>
              <select id="pasoFronterizo" name="pasoFronterizo" className="form-select" value={form.pasoFronterizo} onChange={handleChange} required>
                <option value="Los Libertadores">Los Libertadores</option>
                <option value="Paso Pehuenche">Paso Pehuenche</option>
              </select>
            </div>
          </FormSection>
        </SectionCard>

        <div className="btn-group">
          <button type="button" className="btn btn--secondary" onClick={() => navigate('/ciudadano/dashboard')}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </div>
  )
}
