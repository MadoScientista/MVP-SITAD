import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

const TABS = [
  { id: 'personales', label: 'Datos Personales' },
  { id: 'vehiculo', label: 'Vehículo' },
  { id: 'documentos', label: 'Documentos' },
  { id: 'observaciones', label: 'Observaciones' },
  { id: 'historial', label: 'Historial' },
]

export default function ExpedienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('personales')
  const [solicitud, setSolicitud] = useState(null)
  const [historial, setHistorial] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: `Expediente #${id}` },
      ]} />

      <PageTitle title={`Expediente #${id}`} subtitle={`${solicitud.patente} — ${solicitud.paisDestino}`}>
        <StatusBadge estado={solicitud.estado} />
      </PageTitle>

      <ErrorMessage message={error} />

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`tab ${tab === t.id ? 'tab--active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'personales' && (
        <SectionCard title="Datos del conductor">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-item__label">RUT</span>
              <span className="detail-item__value">{solicitud.conductorRut}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Nombre</span>
              <span className="detail-item__value">{solicitud.conductorNombre}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Es propietario</span>
              <span className="detail-item__value">{solicitud.esPropietario ? 'Sí' : 'No'}</span>
            </div>
            {solicitud.tipoAutorizacion && (
              <div className="detail-item">
                <span className="detail-item__label">Tipo de autorización</span>
                <span className="detail-item__value">{solicitud.tipoAutorizacion}</span>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {tab === 'vehiculo' && (
        <SectionCard title="Datos del vehículo">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-item__label">Patente</span>
              <span className="detail-item__value">{solicitud.patente}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Marca</span>
              <span className="detail-item__value">{solicitud.marca}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Modelo</span>
              <span className="detail-item__value">{solicitud.modelo}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Salida</span>
              <span className="detail-item__value">{solicitud.fechaSalida}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Retorno</span>
              <span className="detail-item__value">{solicitud.fechaRetorno}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Destino</span>
              <span className="detail-item__value">{solicitud.paisDestino}</span>
            </div>
            <div className="detail-item">
              <span className="detail-item__label">Paso fronterizo</span>
              <span className="detail-item__value">{solicitud.pasoFronterizo}</span>
            </div>
          </div>
        </SectionCard>
      )}

      {tab === 'documentos' && (
        <SectionCard title="Documentos asociados">
          {solicitud.documentos && solicitud.documentos.length > 0 ? (
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
          ) : (
            <p className="empty-text">Sin documentos adjuntos</p>
          )}
        </SectionCard>
      )}

      {tab === 'observaciones' && (
        <SectionCard title="Observaciones registradas">
          {historial.filter((h) => h.observacion).length > 0 ? (
            <div className="timeline">
              {historial.filter((h) => h.observacion).map((h) => (
                <div key={h.id} className="timeline-item">
                  <div className="timeline-item__header">
                    <span className={`status-badge status-badge--${h.resultado.toLowerCase()}`}>
                      {h.resultado}
                    </span>
                    <small>{h.fechaControl}</small>
                  </div>
                  <p className="timeline-item__body">{h.observacion}</p>
                  <small className="timeline-item__footer">Funcionario: {h.funcionarioRut}</small>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Sin observaciones registradas</p>
          )}
        </SectionCard>
      )}

      {tab === 'historial' && (
        <SectionCard title="Historial de cambios">
          {historial.length > 0 ? (
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
          ) : (
            <p className="empty-text">Sin historial disponible</p>
          )}
        </SectionCard>
      )}
    </div>
  )
}
