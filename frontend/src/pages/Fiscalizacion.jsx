import { useState, useEffect } from 'react'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function Fiscalizacion() {
  const [solicitudes, setSolicitudes] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('PRE_VALIDADO_DIGITAL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [action, setAction] = useState(null)
  const [observacion, setObservacion] = useState('')

  const cargar = (estado) => {
    setLoading(true)
    setError('')
    const url = estado ? `/api/v1/fiscalizacion/tramites?estado=${estado}` : '/api/v1/fiscalizacion/tramites'
    api.get(url)
      .then(setSolicitudes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar(filtroEstado) }, [filtroEstado])

  const handleConfirm = async () => {
    if (!selected || !action) return
    if (action === 'rechazar' && !observacion.trim()) {
      setError('Debe ingresar una observación para rechazar el trámite')
      return
    }
    try {
      const body = action === 'rechazar' ? { observacion } : { observacion }
      await api.post(`/api/v1/fiscalizacion/tramites/${selected.id}/${action}`, body)
      setSelected(null)
      setAction(null)
      setObservacion('')
      cargar(filtroEstado)
    } catch (e) {
      setError(e.message)
    }
  }

  const columns = [
    { label: 'ID', key: 'id' },
    { label: 'Patente', key: 'patente' },
    { label: 'Marca/Modelo', render: (r) => `${r.marca} ${r.modelo}` },
    { label: 'Destino', key: 'paisDestino' },
    { label: 'Salida', key: 'fechaSalida' },
    { label: 'Retorno', key: 'fechaRetorno' },
    { label: 'Paso', key: 'pasoFronterizo' },
    { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
    {
      label: 'Acciones',
      render: (r) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn--sm btn--primary" onClick={() => { setSelected(r); setAction('aprobar') }}>
            Aprobar
          </button>
          <button className="btn btn--sm btn--danger" onClick={() => { setSelected(r); setAction('rechazar') }}>
            Rechazar
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/funcionario/dashboard' },
        { label: 'Fiscalización' },
      ]} />
      <PageTitle title="Fiscalización" subtitle="Busque y revise trámites de salida temporal" />

      <ErrorMessage message={error} />

      <SectionCard>
        <div className="search-bar">
          <select className="form-select" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            <option value="PRE_VALIDADO_DIGITAL">Pre Validado</option>
            <option value="OBSERVADO">Observado</option>
            <option value="APROBADO_EN_VENTANILLA">Aprobado</option>
            <option value="RECHAZADO">Rechazado</option>
          </select>
          <button className="btn btn--primary" onClick={() => cargar(filtroEstado)}>Buscar</button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <DataTable columns={columns} data={solicitudes} emptyMessage="No se encontraron trámites" />
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!selected && !!action}
        title={action === 'aprobar' ? 'Aprobar trámite' : 'Rechazar trámite'}
        message={action === 'aprobar'
          ? `¿Está seguro de aprobar el trámite ID ${selected?.id}?`
          : `¿Está seguro de rechazar el trámite ID ${selected?.id}?`}
        confirmText={action === 'aprobar' ? 'Aprobar' : 'Rechazar'}
        danger={action === 'rechazar'}
        onConfirm={handleConfirm}
        onCancel={() => { setSelected(null); setAction(null); setObservacion('') }}
      >
        {action === 'rechazar' && (
          <div className="form-group">
            <label className="form-label" htmlFor="obs">Observación *</label>
            <textarea
              id="obs"
              className="form-input"
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ingrese el motivo del rechazo"
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
