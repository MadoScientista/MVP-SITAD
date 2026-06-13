import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import FormSection from '../components/FormSection'
import ErrorMessage from '../components/ErrorMessage'

export default function RegistrarVehiculo() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ patente: '', marca: '', modelo: '', anio: '', paisMatricula: 'Chile' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/api/v1/vehicular/vehiculos', {
        ...form,
        anio: parseInt(form.anio, 10),
      })
      navigate('/ciudadano/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Registrar vehículo' },
      ]} />
      <PageTitle title="Registrar vehículo" subtitle="Ingrese los antecedentes del vehículo" />

      <form onSubmit={handleSubmit}>
        <SectionCard title="Datos del vehículo">
          <ErrorMessage message={error} />

          <FormSection>
            <div className="form-group">
              <label htmlFor="patente">Patente <span className="required">*</span></label>
              <input id="patente" name="patente" className="form-input" value={form.patente} onChange={handleChange} placeholder="ABCD12" required />
            </div>
            <div className="form-group">
              <label htmlFor="marca">Marca <span className="required">*</span></label>
              <input id="marca" name="marca" className="form-input" value={form.marca} onChange={handleChange} placeholder="Toyota" required />
            </div>
            <div className="form-group">
              <label htmlFor="modelo">Modelo <span className="required">*</span></label>
              <input id="modelo" name="modelo" className="form-input" value={form.modelo} onChange={handleChange} placeholder="Corolla" required />
            </div>
            <div className="form-group">
              <label htmlFor="anio">Año <span className="required">*</span></label>
              <input id="anio" name="anio" className="form-input" type="number" min="1990" max="2027" value={form.anio} onChange={handleChange} placeholder="2024" required />
            </div>
            <div className="form-group">
              <label htmlFor="paisMatricula">País de matrícula <span className="required">*</span></label>
              <select id="paisMatricula" name="paisMatricula" className="form-select" value={form.paisMatricula} onChange={handleChange} required>
                <option value="Chile">Chile</option>
                <option value="Argentina">Argentina</option>
                <option value="Perú">Perú</option>
                <option value="Bolivia">Bolivia</option>
                <option value="Brasil">Brasil</option>
              </select>
            </div>
          </FormSection>
        </SectionCard>

        <div className="btn-group">
          <button type="button" className="btn btn--secondary" onClick={() => navigate('/ciudadano/dashboard')}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar vehículo'}
          </button>
        </div>
      </form>
    </div>
  )
}
