import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmDialog from '../components/ConfirmDialog'

export default function Fiscalizacion() {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState('')
  const [tramite, setTramite] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState('')
  const [observacion, setObservacion] = useState('')
  const [aprobado, setAprobado] = useState(false)
  const [rutPasajero, setRutPasajero] = useState('')

  const handleSearch = async () => {
    if (!searchId.trim()) return
    setLoading(true)
    setError('')
    setTramite(null)
    setAprobado(false)
    try {
      const data = await api.get(`/api/v1/fiscalizacion/tramites?id=${searchId.trim()}`)
      if (Array.isArray(data) && data.length > 0) {
        setTramite(data[0])
      } else {
        setError('No se encontró ningún trámite con ese ID')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (tipo) => {
    if (tipo === 'aprobar') {
      setAction(tipo)
      setShowConfirm(true)
    } else {
      setAction(tipo)
      setObservacion('')
      setShowConfirm(true)
    }
  }

  const handleConfirm = async () => {
    if ((action === 'observar' || action === 'rechazar') && !observacion.trim()) {
      setError('Debe ingresar una observación')
      return
    }
    try {
      const body = action === 'aprobar' ? {} : { observacion }
      await api.post(`/api/v1/fiscalizacion/tramites/${tramite.id}/${action}`, body)
      setShowConfirm(false)
      if (action === 'aprobar') {
        setAprobado(true)
      }
      setAction('')
      setObservacion('')
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setAction('')
    setObservacion('')
  }

  const handleNuevaFiscalizacion = () => {
    setSearchId('')
    setTramite(null)
    setAprobado(false)
    setError('')
  }

  const confirmTitle = action === 'aprobar' ? 'Aprobar trámite' : action === 'observar' ? 'Observar trámite' : 'Rechazar trámite'
  const confirmMsg = action === 'aprobar'
    ? `¿Está seguro de aprobar el trámite ID ${tramite?.id}?`
    : action === 'observar'
      ? `¿Está seguro de observar el trámite ID ${tramite?.id}?`
      : `¿Está seguro de rechazar el trámite ID ${tramite?.id}?`

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/funcionario/dashboard' },
        { label: 'Fiscalización' },
      ]} />
      <PageTitle title="Fiscalización" subtitle="Revise y gestione trámites de salida temporal" />

      <ErrorMessage message={error} />

      <SectionCard title="Buscar trámite">
        <div className="search-bar">
          <input className="form-input" style={{ width: 200 }} placeholder="N° de trámite / ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }} />
          <button className="btn btn--primary" onClick={handleSearch} disabled={loading || !searchId.trim()}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </SectionCard>

      {tramite && !aprobado && (
        <div className="two-column-layout" style={{ marginTop: 16 }}>
          <div className="two-column-layout__main">
            <SectionCard title="Alertas policiales">
              <div className="message message--info">
                No se registran alertas activas para este trámite.
              </div>
              <ul style={{ paddingLeft: 24, fontSize: 14, color: '#6C757D', lineHeight: 1.8, marginTop: 8 }}>
                <li>Encargos por robo: Sin novedad</li>
                <li>Arraigo nacional: Sin novedad</li>
                <li>Órdenes de detención: Sin novedad</li>
              </ul>
            </SectionCard>

            <SectionCard title="Información de la solicitud">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-item__label">ID Trámite</span>
                  <span className="detail-item__value">{tramite.id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Estado</span>
                  <span className="detail-item__value"><StatusBadge estado={tramite.estado} /></span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">RUT Conductor</span>
                  <span className="detail-item__value">{tramite.conductorRut}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Nombre Conductor</span>
                  <span className="detail-item__value">{tramite.conductorNombre}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Patente</span>
                  <span className="detail-item__value">{tramite.patente}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Marca / Modelo</span>
                  <span className="detail-item__value">{tramite.marca} {tramite.modelo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">País destino</span>
                  <span className="detail-item__value">{tramite.paisDestino}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Paso fronterizo</span>
                  <span className="detail-item__value">{tramite.pasoFronterizo}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Fecha salida</span>
                  <span className="detail-item__value">{tramite.fechaSalida}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-item__label">Fecha retorno</span>
                  <span className="detail-item__value">{tramite.fechaRetorno}</span>
                </div>
              </div>
            </SectionCard>

            <div className="btn-group" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
              <button className="btn btn--primary" onClick={() => handleAction('aprobar')}>
                Aprobar
              </button>
              <button className="btn btn--warning" onClick={() => handleAction('observar')}>
                Observar
              </button>
              <button className="btn btn--danger" onClick={() => handleAction('rechazar')}>
                Rechazar
              </button>
            </div>
          </div>

          <aside className="sidebar-nav">
            <div className="sidebar-nav__title">Opciones</div>
            <button className="sidebar-nav__btn" onClick={handleNuevaFiscalizacion}>
              Nueva fiscalización
            </button>
            <button className="sidebar-nav__btn sidebar-nav__btn--back" onClick={() => navigate(-1)}>
              Atrás
            </button>
          </aside>
        </div>
      )}

      {tramite && aprobado && (
        <div className="two-column-layout" style={{ marginTop: 16 }}>
          <div className="two-column-layout__main">
            <SectionCard title="Trámite aprobado">
              <div className="message message--success">
                El trámite ID {tramite.id} ha sido aprobado exitosamente.
              </div>

              <div className="form-group" style={{ marginTop: 24 }}>
                <label htmlFor="rutPasajero">Ingrese RUT del pasajero</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input id="rutPasajero" className="form-input" style={{ flex: 1 }} placeholder="12345678-9" value={rutPasajero} onChange={(e) => setRutPasajero(e.target.value)} />
                  <button className="btn btn--primary">Buscar</button>
                  <button className="btn btn--secondary" title="Escanear código QR">
                    Escanear QR
                  </button>
                </div>
              </div>
            </SectionCard>
          </div>

          <aside className="sidebar-nav">
            <div className="sidebar-nav__title">Opciones</div>
            <button className="sidebar-nav__btn" onClick={handleNuevaFiscalizacion}>
              Nueva fiscalización
            </button>
            <button className="sidebar-nav__btn sidebar-nav__btn--back" onClick={() => navigate(-1)}>
              Atrás
            </button>
          </aside>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title={confirmTitle}
        message={confirmMsg}
        confirmText={action === 'aprobar' ? 'Aprobar' : action === 'observar' ? 'Observar' : 'Rechazar'}
        danger={action !== 'aprobar'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        {action !== 'aprobar' && (
          <div className="form-group">
            <label className="form-label" htmlFor="obs">Observación *</label>
            <textarea
              id="obs"
              className="form-input"
              rows={3}
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder={action === 'observar' ? 'Ingrese la observación' : 'Ingrese el motivo del rechazo'}
              autoFocus
            />
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
