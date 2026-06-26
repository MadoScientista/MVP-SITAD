import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import SidebarNav from '../components/SidebarNav'

const ESTADOS = ['', 'BORRADOR', 'PENDIENTE_DOCUMENTACION', 'PRE_VALIDADO_DIGITAL', 'OBSERVADO', 'APROBADO_EN_VENTANILLA', 'RECHAZADO']

export default function ConsultarEstado() {
  const navigate = useNavigate()
  const location = useLocation()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroFechaDesde, setFiltroFechaDesde] = useState('')
  const [filtroFechaHasta, setFiltroFechaHasta] = useState('')
  const [filtroVehiculo, setFiltroVehiculo] = useState('')

  useEffect(() => {
    api.get('/api/v1/vehicular/solicitudes')
      .then(setSolicitudes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtradas = useMemo(() => {
    let result = solicitudes
    if (filtroEstado) result = result.filter((s) => s.estado === filtroEstado)
    if (filtroFechaDesde) {
      const desde = new Date(filtroFechaDesde + 'T00:00:00')
      result = result.filter((s) => new Date(s.fechaSolicitud) >= desde)
    }
    if (filtroFechaHasta) {
      const hasta = new Date(filtroFechaHasta + 'T23:59:59')
      result = result.filter((s) => new Date(s.fechaSolicitud) <= hasta)
    }
    if (filtroVehiculo.trim()) {
      const q = filtroVehiculo.trim().toUpperCase()
      result = result.filter((s) => s.patente.toUpperCase().includes(q) || s.marca.toUpperCase().includes(q))
    }
    return result.sort((a, b) => new Date(b.fechaSolicitud) - new Date(a.fechaSolicitud))
  }, [solicitudes, filtroEstado, filtroFechaDesde, filtroFechaHasta, filtroVehiculo])

  const columns = [
    { label: 'Fecha', key: 'fechaSolicitud' },
    { label: 'Patente', key: 'patente' },
    { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
    { label: 'Acción', render: (r) => (
      <div style={{ display: 'flex', gap: 4 }}>
        {(r.estado === 'BORRADOR' || r.estado === 'OBSERVADO') && (
          <button className="btn btn--sm btn--secondary" onClick={() => navigate(`/ciudadano/solicitudes/editar/${r.id}`)}>Editar</button>
        )}
        <button className="btn btn--sm btn--primary" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Detalle</button>
      </div>
    ) },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Mis solicitudes' },
      ]} />
      <PageTitle title="Mis solicitudes" subtitle="Consulte el estado de sus trámites" />

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <SectionCard>
            <div className="search-bar">
              <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                <option value="">Todos los estados</option>
                {ESTADOS.filter(Boolean).map((e) => (
                  <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
                ))}
              </select>
              <input className="form-input" type="date" value={filtroFechaDesde} onChange={(e) => setFiltroFechaDesde(e.target.value)} placeholder="Fecha desde" />
              <input className="form-input" type="date" value={filtroFechaHasta} onChange={(e) => setFiltroFechaHasta(e.target.value)} placeholder="Fecha hasta" />
              <input className="form-input" placeholder="Buscar vehículo (patente/marca)" value={filtroVehiculo} onChange={(e) => setFiltroVehiculo(e.target.value)} />
            </div>

            <DataTable columns={columns} data={filtradas} emptyMessage="No has realizado solicitudes de salida temporal" />
          </SectionCard>
        </div>

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
