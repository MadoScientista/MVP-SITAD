import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

const ESTADOS = ['', 'BORRADOR', 'PENDIENTE_DOCUMENTACION', 'PRE_VALIDADO_DIGITAL', 'OBSERVADO', 'APROBADO_EN_VENTANILLA', 'RECHAZADO']

export default function ConsultarEstado() {
  const navigate = useNavigate()
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busquedaPatente, setBusquedaPatente] = useState('')

  useEffect(() => {
    api.get('/api/v1/vehicular/solicitudes')
      .then(setSolicitudes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtradas = useMemo(() => {
    let result = solicitudes
    if (filtroEstado) result = result.filter((s) => s.estado === filtroEstado)
    if (busquedaPatente.trim()) {
      const p = busquedaPatente.trim().toUpperCase()
      result = result.filter((s) => s.patente.toUpperCase().includes(p))
    }
    return result
  }, [solicitudes, filtroEstado, busquedaPatente])

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Patente', key: 'patente' },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
    { label: 'Fecha solicitud', key: 'fechaSolicitud' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Retorno', key: 'fechaRetorno' },
    { label: 'Observación', key: 'observacion' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
    { label: 'Acción', render: (r) => <button className="btn btn--sm btn--primary" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Detalle</button> },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Mis solicitudes' },
      ]} />
      <PageTitle title="Mis solicitudes" subtitle="Consulte el estado de sus trámites" />

      <SectionCard>
        <div className="search-bar" style={{ marginBottom: 16 }}>
          <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.filter(Boolean).map((e) => (
              <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input className="form-input" placeholder="Buscar por patente" value={busquedaPatente} onChange={(e) => setBusquedaPatente(e.target.value)} />
        </div>

        <DataTable columns={columns} data={filtradas} emptyMessage="No has realizado solicitudes de salida temporal" />
      </SectionCard>
    </div>
  )
}
