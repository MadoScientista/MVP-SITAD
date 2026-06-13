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

export default function DashboardFuncionario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendientes, setPendientes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/v1/fiscalizacion/tramites?estado=PRE_VALIDADO_DIGITAL')
      .then(setPendientes)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Patente', key: 'patente' },
    { label: 'Marca', key: 'marca' },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
    {
      label: 'Acción',
      render: (r) => (
        <button className="btn btn--sm btn--primary" onClick={() => navigate('/funcionario/fiscalizacion')}>
          Revisar
        </button>
      ),
    },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Inicio' }]} />
      <PageTitle title={`Bienvenido, ${user?.nombre}`} subtitle="Panel funcionario" />

      <SectionCard title="Trámites pendientes de revisión">
        <div className="dashboard-stat" style={{ textAlign: 'left', padding: 0, marginBottom: 16 }}>
          <div className="dashboard-stat__number">{pendientes.length}</div>
          <div className="dashboard-stat__label">Solicitudes en espera</div>
        </div>

        <DataTable columns={columns} data={pendientes} emptyMessage="No hay trámites pendientes" />
      </SectionCard>

      <div className="mt-24">
        <button className="btn btn--primary" onClick={() => navigate('/funcionario/fiscalizacion')}>
          Ir a Fiscalización
        </button>
      </div>
    </div>
  )
}
