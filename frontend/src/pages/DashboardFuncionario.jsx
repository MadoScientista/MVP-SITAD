import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

const TABS = [
  { id: 'PRE_VALIDADO_DIGITAL', label: 'Pendientes' },
  { id: 'OBSERVADO', label: 'Observadas' },
  { id: 'APROBADO_EN_VENTANILLA', label: 'Aprobadas' },
  { id: 'RECHAZADO', label: 'Rechazadas' },
  { id: 'TODOS', label: 'Todas' },
]

export default function DashboardFuncionario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('PRE_VALIDADO_DIGITAL')
  const [tramites, setTramites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchPatente, setSearchPatente] = useState('')
  const [searchRut, setSearchRut] = useState('')
  const [searchId, setSearchId] = useState('')

  const cargar = useCallback((estado) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (estado && estado !== 'TODOS') params.set('estado', estado)
    const qs = params.toString()
    api.get(`/api/v1/fiscalizacion/tramites${qs ? `?${qs}` : ''}`)
      .then(setTramites)
      .catch(() => setTramites([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar(tab) }, [tab, cargar])

  const handleSearch = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (tab && tab !== 'TODOS') params.set('estado', tab)
    if (searchPatente.trim()) params.set('patente', searchPatente.trim())
    if (searchRut.trim()) params.set('rut', searchRut.trim())
    if (searchId.trim()) params.set('id', searchId.trim())
    const qs = params.toString()
    api.get(`/api/v1/fiscalizacion/tramites${qs ? `?${qs}` : ''}`)
      .then(setTramites)
      .catch(() => setTramites([]))
      .finally(() => setLoading(false))
  }

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Patente', key: 'patente' },
    { label: 'Marca', key: 'marca' },
    { label: 'Conductor', key: 'conductorNombre' },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
    {
      label: 'Acción',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--sm btn--primary" onClick={() => navigate(`/funcionario/expedientes/${r.id}`)}>
            Detalle
          </button>
          <button className="btn btn--sm btn--secondary" onClick={() => navigate('/funcionario/fiscalizacion')}>
            Revisar
          </button>
        </div>
      ),
    },
  ]

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Inicio' }]} />
      <PageTitle title={`Bienvenido, ${user?.nombre}`} subtitle="Panel funcionario" />

      <SectionCard title="Bandeja operacional">
        <div className="tabs" style={{ marginBottom: 16 }}>
          {TABS.map((t) => (
            <button key={t.id} className={`tab ${tab === t.id ? 'tab--active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="search-bar" style={{ marginBottom: 16 }}>
          <input className="form-input" style={{ width: 140 }} placeholder="Patente" value={searchPatente} onChange={(e) => setSearchPatente(e.target.value)} />
          <input className="form-input" style={{ width: 160 }} placeholder="RUN" value={searchRut} onChange={(e) => setSearchRut(e.target.value)} />
          <input className="form-input" style={{ width: 140 }} placeholder="N° Expediente" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
          <button className="btn btn--primary" onClick={handleSearch}>Buscar</button>
        </div>

        <DataTable columns={columns} data={tramites} emptyMessage="No se encontraron trámites" />
      </SectionCard>
    </div>
  )
}
