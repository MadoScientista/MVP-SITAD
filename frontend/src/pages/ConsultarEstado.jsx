import { useState, useEffect } from 'react'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function ConsultarEstado() {
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/vehicular/solicitudes')
      .then(setSolicitudes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Patente', key: 'patente' },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
    { label: 'Fecha solicitud', key: 'fechaSolicitud' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Retorno', key: 'fechaRetorno' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
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
        <DataTable columns={columns} data={solicitudes} emptyMessage="No has realizado solicitudes de salida temporal" />
      </SectionCard>
    </div>
  )
}
