import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'

const ESTADOS_PENDIENTES = ['BORRADOR', 'PENDIENTE_DOCUMENTACION']
const ESTADO_PRE_VALIDADO = 'PRE_VALIDADO_DIGITAL'

const TABS = [
  { id: 'PRE_VALIDADO_DIGITAL', label: 'Pre Validado' },
  { id: 'PENDIENTES', label: 'Pendientes' },
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

  const cargar = useCallback(() => {
    setLoading(true)
    api.get('/api/v1/fiscalizacion/tramites')
      .then(setTramites)
      .catch(() => setTramites([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtradas = useMemo(() => {
    let result = tramites
    if (tab === 'PENDIENTES') {
      result = result.filter((t) => ESTADOS_PENDIENTES.includes(t.estado))
    } else if (tab !== 'TODOS') {
      result = result.filter((t) => t.estado === tab)
    }
    if (searchPatente.trim()) {
      const p = searchPatente.trim().toUpperCase()
      result = result.filter((t) => t.patente.toUpperCase().includes(p))
    }
    if (searchRut.trim()) {
      const r = searchRut.trim()
      result = result.filter((t) => t.conductorRut?.includes(r))
    }
    if (searchId.trim()) {
      result = result.filter((t) => String(t.id).includes(searchId.trim()))
    }
    return result
  }, [tramites, tab, searchPatente, searchRut, searchId])

  const handleSearch = () => {
    setLoading(true)
    cargar()
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
        <button className="btn btn--sm btn--primary" onClick={() => navigate(`/funcionario/expedientes/${r.id}`)}>
          Ir a solicitud
        </button>
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
          <button className="btn btn--secondary" onClick={() => navigate('/funcionario/fiscalizacion')}>Nueva Fiscalización</button>
        </div>

        <DataTable columns={columns} data={filtradas} emptyMessage="No se encontraron trámites" />
      </SectionCard>
    </div>
  )
}
