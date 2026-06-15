import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SidebarNav from '../components/SidebarNav'

export default function MisVehiculos() {
  const navigate = useNavigate()
  const location = useLocation()
  const [vehiculos, setVehiculos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const cargarVehiculos = () => {
    setLoading(true)
    api.get('/api/v1/vehicular/vehiculos')
      .then((data) => setVehiculos(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargarVehiculos() }, [])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este vehículo?')) return
    try {
      await api.del(`/api/v1/vehicular/vehiculos/${id}`)
      cargarVehiculos()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Mis vehículos' },
      ]} />
      <PageTitle title="Mis vehículos" subtitle="Gestión de vehículos registrados" />

      <ErrorMessage message={error} />

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <SectionCard title="Vehículos registrados">
            {vehiculos.length === 0 ? (
              <p className="empty-text">No tienes vehículos registrados. Utilice el botón "Registrar vehículo" para agregar uno.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patente</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Año</th>
                    <th>País Matrícula</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {vehiculos.map((v) => (
                    <tr key={v.id}>
                      <td>{v.patente}</td>
                      <td>{v.marca}</td>
                      <td>{v.modelo}</td>
                      <td>{v.anio}</td>
                      <td>{v.paisMatricula}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn--sm btn--secondary" onClick={() => navigate(`/ciudadano/vehiculos/editar/${v.id}`)}>
                            Editar
                          </button>
                          <button className="btn btn--sm btn--danger" onClick={() => handleEliminar(v.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </SectionCard>
        </div>

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
