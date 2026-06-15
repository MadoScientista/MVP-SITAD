import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import SidebarNav from '../components/SidebarNav'

export default function ExpedienteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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

          {historial.length > 0 && (
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

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
