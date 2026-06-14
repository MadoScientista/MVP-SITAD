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

const ESTADOS_NO_TERMINALES = ['BORRADOR', 'PENDIENTE_DOCUMENTACION', 'PRE_VALIDADO_DIGITAL', 'OBSERVADO']

export default function DashboardCiudadano() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get('/api/v1/vehicular/vehiculos').catch(() => []),
      api.get('/api/v1/vehicular/solicitudes').catch(() => []),
    ])
      .then(([v, s]) => {
        if (cancelled) return
        setVehiculos(Array.isArray(v) ? v : [])
        setSolicitudes(Array.isArray(s) ? s : [])
      })
      .catch(() => {
        if (!cancelled) setApiError('Error al cargar datos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const hoy = new Date()
  const proximosViajes = solicitudes.filter((s) => {
    if (!s.fechaSalida) return false
    const salida = new Date(s.fechaSalida + (s.fechaSalida.includes('T') ? '' : 'T00:00:00'))
    return salida >= hoy && ESTADOS_NO_TERMINALES.includes(s.estado)
  })

  const observacionesPendientes = solicitudes.filter((s) => s.estado === 'OBSERVADO')

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

      {apiError && <div className="message message--error">{apiError}</div>}

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

      {proximosViajes.length > 0 && (
        <SectionCard title="Próximos viajes" className="mt-24">
          <DataTable
            columns={[
              ...solicitudColumns,
              { label: 'Acción', render: (r) => <button className="btn btn--sm btn--primary" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Ver</button> },
            ]}
            data={proximosViajes}
            emptyMessage="Sin viajes próximos"
          />
        </SectionCard>
      )}

      {observacionesPendientes.length > 0 && (
        <SectionCard title="Observaciones pendientes" className="mt-24">
          <p className="form-text" style={{ marginBottom: 12 }}>
            Los siguientes expedientes tienen observaciones del funcionario. Revise y corrija la información.
          </p>
          <DataTable
            columns={[
              { label: 'Patente', key: 'patente' },
              { label: 'Destino', key: 'paisDestino' },
              { label: 'Observación', key: 'observacion' },
              { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
              { label: 'Acción', render: (r) => <button className="btn btn--sm btn--warning" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Corregir</button> },
            ]}
            data={observacionesPendientes}
            emptyMessage="Sin observaciones pendientes"
          />
        </SectionCard>
      )}

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
