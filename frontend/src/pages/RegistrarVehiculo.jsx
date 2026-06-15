import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import FormSection from '../components/FormSection'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import SidebarNav from '../components/SidebarNav'

export default function RegistrarVehiculo() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()
  const esEdicion = Boolean(id)

  const [form, setForm] = useState({
    patente: '',
    numeroChasis: '',
    marca: '',
    modelo: '',
    anio: '',
    paisMatricula: 'Chile',
    propietarioNombre: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(esEdicion)

  useEffect(() => {
    if (!esEdicion) return
    api.get(`/api/v1/vehicular/vehiculos/${id}`)
      .then((v) => {
        setForm({
          patente: v.patente,
          numeroChasis: v.numeroChasis || '',
          marca: v.marca,
          modelo: v.modelo,
          anio: String(v.anio),
          paisMatricula: v.paisMatricula,
          propietarioNombre: v.propietarioNombre || '',
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoadingData(false))
  }, [id, esEdicion])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = {
        ...form,
        anio: parseInt(form.anio, 10),
      }
      if (esEdicion) {
        await api.put(`/api/v1/vehicular/vehiculos/${id}`, body)
      } else {
        await api.post('/api/v1/vehicular/vehiculos', body)
      }
      navigate('/ciudadano/vehiculos')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Mis vehículos', to: '/ciudadano/vehiculos' },
        { label: esEdicion ? 'Editar vehículo' : 'Registrar vehículo' },
      ]} />
      <PageTitle
        title={esEdicion ? 'Editar vehículo' : 'Registrar vehículo'}
        subtitle="Ingrese los antecedentes del vehículo"
      />

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <form onSubmit={handleSubmit}>
            <SectionCard title="Datos del vehículo">
              <ErrorMessage message={error} />

              <FormSection>
                <div className="form-group">
                  <label htmlFor="patente">Patente <span className="required">*</span></label>
                  <input id="patente" name="patente" className="form-input" value={form.patente} onChange={handleChange} placeholder="ABCD12" required />
                </div>
                <div className="form-group">
                  <label htmlFor="numeroChasis">Nro. Chasís/Vin/Motor</label>
                  <input id="numeroChasis" name="numeroChasis" className="form-input" value={form.numeroChasis} onChange={handleChange} placeholder="8APBSC404KB123456" />
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
                <div className="form-group">
                  <label htmlFor="propietarioNombre">Propietario</label>
                  <input id="propietarioNombre" name="propietarioNombre" className="form-input" value={form.propietarioNombre} onChange={handleChange} placeholder="Nombre del propietario" />
                </div>
              </FormSection>
            </SectionCard>

            <div className="btn-group">
              <button type="button" className="btn btn--secondary" onClick={() => navigate('/ciudadano/vehiculos')}>Cancelar</button>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? 'Guardando...' : (esEdicion ? 'Actualizar vehículo' : 'Guardar vehículo')}
              </button>
            </div>
          </form>
        </div>

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
