import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function DashboardCiudadano() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/api/v1/vehicular/vehiculos'),
      api.get('/api/v1/vehicular/solicitudes'),
    ])
      .then(([v, s]) => { setVehiculos(v); setSolicitudes(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const solicitudColumns = [
    { label: 'Patente', key: 'patente' },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Retorno', key: 'fechaRetorno' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Inicio' }]} />
      <PageTitle title={`Bienvenido, ${user?.nombre}`} subtitle="Panel ciudadano" />

      <div className="dashboard-grid">
        <SectionCard title="Mis vehículos">
          <div className="dashboard-stat">
            <div className="dashboard-stat__number">{vehiculos.length}</div>
            <div className="dashboard-stat__label">Vehículos registrados</div>
          </div>
          <div className="quick-actions">
            <button className="btn btn--primary" onClick={() => navigate('/ciudadano/vehiculos/registrar')}>
              + Registrar vehículo
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Mis solicitudes">
          <div className="dashboard-stat">
            <div className="dashboard-stat__number">{solicitudes.length}</div>
            <div className="dashboard-stat__label">Solicitudes realizadas</div>
          </div>
          <div className="quick-actions">
            <button className="btn btn--primary" onClick={() => navigate('/ciudadano/solicitudes/nueva')}>
              + Nueva solicitud
            </button>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Solicitudes recientes" className="mt-24">
        <DataTable columns={solicitudColumns} data={solicitudes.slice(0, 5)} emptyMessage="No has realizado solicitudes" />
      </SectionCard>

      {solicitudes.length > 5 && (
        <div className="text-center mt-16">
          <button className="btn btn--secondary" onClick={() => navigate('/ciudadano/solicitudes')}>
            Ver todas las solicitudes
          </button>
        </div>
      )}
    </div>
  )
}
