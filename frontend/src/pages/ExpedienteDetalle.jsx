import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmDialog from '../components/ConfirmDialog'
import QrCodeDisplay from '../components/QrCodeDisplay'

const LINKS_CIUDADANO = [
  { label: 'Solicitar ingreso o salida temporal de vehículo', path: '/ciudadano/solicitudes/nueva' },
  { label: 'Mis vehículos', path: '/ciudadano/vehiculos' },
  { label: 'Mis solicitudes', path: '/ciudadano/solicitudes' },
]

const LINKS_FUNCIONARIO = [
  { label: 'Panel de solicitudes', path: '/funcionario/dashboard' },
  { label: 'Nueva Fiscalización', path: '/funcionario/fiscalizacion' },
]

export default function ExpedienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const esFuncionario = user?.rol === 'FUNCIONARIO'
  const [solicitud, setSolicitud] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState('')
  const [observacion, setObservacion] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get(`/api/v1/vehicular/solicitudes/${id}`),
      api.get(`/api/v1/fiscalizacion/tramites/${id}/historial`).catch(() => []),
    ])
      .then(([s, h]) => {
        if (cancelled) return
        setSolicitud(s)
        setHistorial(Array.isArray(h) ? h : [])
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  const handleAction = (tipo) => {
    setAction(tipo)
    setObservacion('')
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if ((action === 'observar' || action === 'rechazar') && !observacion.trim()) {
      setError('Debe ingresar una observación')
      return
    }
    try {
      const body = action === 'preAprobar' ? {} : { observacion }
      await api.post(`/api/v1/fiscalizacion/tramites/${id}/${action}`, body)
      setShowConfirm(false)
      setAction('')
      setObservacion('')
      const s = await api.get(`/api/v1/vehicular/solicitudes/${id}`)
      setSolicitud(s)
      const h = await api.get(`/api/v1/fiscalizacion/tramites/${id}/historial`).catch(() => [])
      setHistorial(Array.isArray(h) ? h : [])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setAction('')
    setObservacion('')
  }

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="page-container">
        <ErrorMessage message={error} />
        <button className="btn btn--secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  if (!solicitud) {
    return (
      <div className="page-container">
        <p>Expediente no encontrado</p>
        <button className="btn btn--secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
    )
  }

  const confirmTitle = action === 'preAprobar' ? 'Pre-Aprobar trámite' : action === 'observar' ? 'Observar trámite' : 'Rechazar trámite'
  const confirmMsg = action === 'preAprobar'
    ? `¿Está seguro de pre-aprobar el trámite ID ${id}?`
    : action === 'observar'
      ? `¿Está seguro de observar el trámite ID ${id}?`
      : `¿Está seguro de rechazar el trámite ID ${id}?`

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: esFuncionario ? '/funcionario/dashboard' : '/ciudadano/dashboard' },
        { label: `Expediente #${id}` },
      ]} />

      <PageTitle title={`Expediente #${id}`} subtitle={`${solicitud.patente} — ${solicitud.paisDestino}`}>
        <StatusBadge estado={solicitud.estado} />
      </PageTitle>

      <ErrorMessage message={error} />

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <SectionCard title="Información de la solicitud">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-item__label">RUT Conductor</span>
                <span className="detail-item__value">{solicitud.conductorRut}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Nombre Conductor</span>
                <span className="detail-item__value">
                  {solicitud.conductorNombre}
                  {solicitud.conductorApellidoPaterno ? ` ${solicitud.conductorApellidoPaterno}` : ''}
                  {solicitud.conductorApellidoMaterno ? ` ${solicitud.conductorApellidoMaterno}` : ''}
                </span>
              </div>
              {solicitud.conductorNumeroDocumento && (
                <div className="detail-item">
                  <span className="detail-item__label">N° Documento</span>
                  <span className="detail-item__value">{solicitud.conductorNumeroDocumento}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-item__label">Es propietario</span>
                <span className="detail-item__value">{solicitud.esPropietario ? 'Sí' : 'No'}</span>
              </div>
              {solicitud.tipoAutorizacion && (
                <div className="detail-item">
                  <span className="detail-item__label">Tipo autorización</span>
                  <span className="detail-item__value">{solicitud.tipoAutorizacion.replace(/_/g, ' ')}</span>
                </div>
              )}
              <div className="detail-item">
                <span className="detail-item__label">Patente</span>
                <span className="detail-item__value">{solicitud.patente}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Marca / Modelo</span>
                <span className="detail-item__value">{solicitud.marca} {solicitud.modelo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">País destino</span>
                <span className="detail-item__value">{solicitud.paisDestino}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Paso fronterizo</span>
                <span className="detail-item__value">{solicitud.pasoFronterizo}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Fecha salida</span>
                <span className="detail-item__value">{solicitud.fechaSalida}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Fecha retorno</span>
                <span className="detail-item__value">{solicitud.fechaRetorno}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Fecha solicitud</span>
                <span className="detail-item__value">{solicitud.fechaSolicitud}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Último cambio estado</span>
                <span className="detail-item__value">{solicitud.fechaEstado}</span>
              </div>
              <div className="detail-item">
                <span className="detail-item__label">Estado actual</span>
                <span className="detail-item__value"><StatusBadge estado={solicitud.estado} /></span>
              </div>
            </div>
          </SectionCard>

          {solicitud.documentos && solicitud.documentos.length > 0 && (
            <SectionCard title="Documentos adjuntos">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Archivo</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitud.documentos.map((doc) => (
                    <tr key={doc.id}>
                      <td>{doc.nombre}</td>
                      <td>{doc.tipo.replace(/_/g, ' ')}</td>
                      <td>{doc.archivo}</td>
                      <td>{doc.fechaCreacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}

          {!esFuncionario && solicitud.codigoAprobacion && (
            <SectionCard title="Código de aprobación QR">
              <div style={{ textAlign: 'center' }}>
                <QrCodeDisplay data={`SITAD-APROBACION:${solicitud.id}:${solicitud.codigoAprobacion}`} size={200} />
                <div style={{ fontSize: 14, color: '#6C757D', lineHeight: 1.8, marginTop: 16 }}>
                  {esFuncionario ? (
                    <p>Código QR de aprobación del trámite. El pasajero debe presentarlo en el paso fronterizo.</p>
                  ) : (
                    <p>Presente este código QR en el paso fronterizo para validar su permiso de salida/ingreso temporal.</p>
                  )}
                  <p><strong>Código:</strong> <code style={{ fontSize: 12 }}>{solicitud.codigoAprobacion}</code></p>
                  <p><strong>Vigencia:</strong> {solicitud.fechaSalida} — {solicitud.fechaRetorno}</p>
                </div>
              </div>
            </SectionCard>
          )}

          {historial.filter(h => h.observacion).length > 0 && (
            <SectionCard title="Observaciones">
              <div className="timeline">
                {historial.filter(h => h.observacion).map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-item__header">
                      <span className={`status-badge status-badge--${h.resultado.toLowerCase()}`}>
                        {h.resultado}
                      </span>
                      <small>{h.fechaControl}</small>
                    </div>
                    <p className="timeline-item__body">{h.observacion}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {esFuncionario && historial.length > 0 && (
            <SectionCard title="Historial de cambios y observaciones">
              <div className="timeline">
                {historial.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-item__header">
                      <span className={`status-badge status-badge--${h.resultado.toLowerCase()}`}>
                        {h.resultado}
                      </span>
                      <small>{h.fechaControl}</small>
                    </div>
                    {h.observacion && <p className="timeline-item__body">{h.observacion}</p>}
                    <small className="timeline-item__footer">Funcionario: {h.funcionarioRut}</small>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        <aside className="sidebar-nav">
          <div className="sidebar-nav__title">Navegación</div>
          {(esFuncionario ? LINKS_FUNCIONARIO : LINKS_CIUDADANO).map((link) => (
            <button
              key={link.path}
              className={`sidebar-nav__btn ${location.pathname === link.path ? 'sidebar-nav__btn--active' : ''}`}
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </button>
          ))}
          <button className="sidebar-nav__btn sidebar-nav__btn--back" onClick={() => navigate(-1)}>
            Volver atrás
          </button>

          {!esFuncionario && (solicitud.estado === 'BORRADOR' || solicitud.estado === 'OBSERVADO') && (
            <>
              <div className="sidebar-nav__title" style={{ marginTop: 16 }}>Acciones</div>
              <button className="btn btn--primary" style={{ width: '100%', height: 40, fontSize: 14 }} onClick={() => navigate(`/ciudadano/solicitudes/editar/${id}`)}>
                Editar solicitud
              </button>
            </>
          )}

          {esFuncionario && (
            <>
              <div className="sidebar-nav__title" style={{ marginTop: 16 }}>Acciones</div>
              <button className="btn btn--primary" style={{ width: '100%', height: 40, fontSize: 14 }} onClick={() => handleAction('preAprobar')}>
                Pre-Aprobar
              </button>
              <button className="btn btn--warning" style={{ width: '100%', height: 40, fontSize: 14 }} onClick={() => handleAction('observar')}>
                Observar
              </button>
              <button className="btn btn--danger" style={{ width: '100%', height: 40, fontSize: 14 }} onClick={() => handleAction('rechazar')}>
                Rechazar
              </button>
            </>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title={confirmTitle}
        message={confirmMsg}
        confirmText={action === 'preAprobar' ? 'Pre-Aprobar' : action === 'observar' ? 'Observar' : 'Rechazar'}
        danger={action !== 'preAprobar'}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        {action !== 'preAprobar' && (
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
