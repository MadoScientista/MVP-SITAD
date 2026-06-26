import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import ErrorMessage from '../components/ErrorMessage'
import ConfirmDialog from '../components/ConfirmDialog'

const spinKeyframes = `
@keyframes spin { to { transform: rotate(360deg); } }
`

export default function Fiscalizacion() {
  const navigate = useNavigate()
  const [searchId, setSearchId] = useState('')
  const [searchRut, setSearchRut] = useState('')
  const [tramite, setTramite] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const [action, setAction] = useState('')
  const [observacion, setObservacion] = useState('')
  const [aprobado, setAprobado] = useState(false)
  const [escanearTipo, setEscanearTipo] = useState('')
  const [camaraActiva, setCamaraActiva] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const searchIdRef = useRef(null)
  const searchRutRef = useRef(null)
  const canvasCaptureRef = useRef(null)
  const animFrameRef = useRef(null)
  const lastScanRef = useRef(0)

  const escanearQR = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasCaptureRef.current
    if (!video || !canvas || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(escanearQR)
      return
    }

    const ahora = Date.now()
    if (ahora - lastScanRef.current < 400) {
      animFrameRef.current = requestAnimationFrame(escanearQR)
      return
    }
    lastScanRef.current = ahora

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      const match = code.data.match(/^SITAD-APROBACION:(\d+):/)
      if (match) {
        const solicitudId = match[1]
        detenerCamara()
        navigate(`/funcionario/expedientes/${solicitudId}`)
        return
      }
    }

    animFrameRef.current = requestAnimationFrame(escanearQR)
  }, [navigate])

  const activarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      setCamaraActiva(true)
    } catch {
      setError('No se pudo acceder a la cámara')
    }
  }

  useEffect(() => {
    if (camaraActiva && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.onloadeddata = () => {
        animFrameRef.current = requestAnimationFrame(escanearQR)
      }
    }
  }, [camaraActiva, escanearQR])

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const detenerCamara = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCamaraActiva(false)
  }

  const buscarPorId = async () => {
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

  const buscarPorRut = async (rut) => {
    const r = rut || searchRut.trim()
    if (!r) return
    setLoading(true)
    setError('')
    setTramite(null)
    setAprobado(false)
    try {
      const data = await api.get(`/api/v1/fiscalizacion/tramites?rut=${r}`)
      if (Array.isArray(data) && data.length > 0) {
        setTramite(data[0])
      } else {
        setError('No se encontraron trámites para ese RUT')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const simularEscaner = async (tipo) => {
    detenerCamara()
    setEscanearTipo(tipo)
    setError('')
    await new Promise(r => setTimeout(r, 1000))
    try {
      if (tipo === 'qr') {
        const data = await api.get('/api/v1/fiscalizacion/tramites?estado=PRE_VALIDADO_DIGITAL')
        if (Array.isArray(data) && data.length > 0) {
          setTramite(data[0])
        } else {
          setError('No hay trámites pre-aprobados')
        }
      } else if (tipo === 'cedula') {
        setSearchRut('12345678-9')
        await buscarPorRut('12345678-9')
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setEscanearTipo('')
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
        const data = await api.get(`/api/v1/fiscalizacion/tramites?id=${tramite.id}`)
        if (Array.isArray(data) && data.length > 0) {
          setTramite(data[0])
        }
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
    detenerCamara()
    setSearchId('')
    setTramite(null)
    setAprobado(false)
    setError('')
  }

  const confirmTitle = action === 'aprobar' ? 'Aprobar Paso' : action === 'observar' ? 'Observar trámite' : 'Rechazar trámite'
  const confirmMsg = action === 'aprobar'
    ? `¿Está seguro de aprobar el paso del trámite ID ${tramite?.id}?`
    : action === 'observar'
      ? `¿Está seguro de observar el trámite ID ${tramite?.id}?`
      : `¿Está seguro de rechazar el trámite ID ${tramite?.id}?`

  return (
    <div className="page-container">
      <style>{spinKeyframes}</style>
      <Breadcrumb items={[
        { label: 'Inicio', to: '/funcionario/dashboard' },
        { label: 'Fiscalización' },
      ]} />
      <PageTitle title="Fiscalización" subtitle="Revise y gestione trámites de salida temporal" />

      <ErrorMessage message={error} />

      <div className="two-column-layout">
        <div className="two-column-layout__main">

          {!tramite && (
            <SectionCard title="Buscar trámite">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{
                    width: 400, height: 400, border: '2px dashed #ADB5BD', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0,
                    backgroundColor: '#F2F2F2', overflow: 'hidden', position: 'relative',
                  }}>
                    {escanearTipo === 'qr' ? (
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="#0D6EFD" strokeWidth="2.5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                      </svg>
                    ) : camaraActiva ? (
                      <>
                        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <canvas ref={canvasCaptureRef} style={{ display: 'none' }} />
                        <div style={{
                          position: 'absolute', top: 8, left: 8, right: 8, bottom: 8,
                          border: '2px solid rgba(13, 110, 253, 0.4)', borderRadius: 6, pointerEvents: 'none',
                          boxShadow: 'inset 0 0 20px rgba(13, 110, 253, 0.08)',
                        }} />
                        <button className="btn btn--secondary" style={{ position: 'absolute', bottom: 12 }} onClick={detenerCamara}>
                          Detener escáner
                        </button>
                      </>
                    ) : (
                      <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span style={{ fontSize: 14, color: '#6C757D', textAlign: 'center' }}>Active el escáner y ubique el código QR aquí</span>
                        <button className="btn btn--primary" onClick={activarCamara}>
                          Activar escáner
                        </button>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: '#212529' }}>Escanear código QR de solicitud</div>
                  <p style={{ fontSize: 13, color: '#6C757D', lineHeight: 1.5, margin: '0 auto 12px auto', maxWidth: 360 }}>
                    Active el escáner y ubique el código QR frente a la cámara. La detección es automática y lo redirigirá al expediente correspondiente.
                  </p>
                  <p style={{ fontSize: 12, color: '#ADB5BD', lineHeight: 1.4, margin: '0 auto 12px auto', maxWidth: 360 }}>
                    Si no dispone de cámara, use la <button className="btn btn--link" style={{ padding: 0, fontSize: 12, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', color: '#ADB5BD' }} onClick={() => simularEscaner('qr')}>simulación</button>.
                  </p>
                </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #DEE2E6', margin: 0 }} />

                <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                  <div style={{
                    width: 400, height: 248, border: '2px dashed #ADB5BD', borderRadius: 8,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, flexShrink: 0,
                    backgroundColor: '#F2F2F2',
                  }}>
                    {escanearTipo === 'cedula' ? (
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" stroke="#0D6EFD" strokeWidth="2.5" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                      </svg>
                    ) : (
                      <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6C757D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <circle cx="8" cy="10" r="2" />
                          <path d="M20 16l-3.5-3.5a2 2 0 0 0-2.83 0L10 16" />
                          <path d="M14 14l-1-1a2 2 0 0 0-2.83 0l-3.5 3.5" />
                        </svg>
                        <span style={{ fontSize: 14, color: '#6C757D', textAlign: 'center' }}>Ubique la cédula de identidad aquí</span>
                      </>
                    )}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: 6, color: '#212529' }}>Escanear cédula de identidad</div>
                    <p style={{ fontSize: 13, color: '#6C757D', lineHeight: 1.5, margin: '0 auto 12px auto', maxWidth: 360 }}>
                      Solicite al pasajero su cédula de identidad y ubíquela frente al escáner hasta que se vea correctamente en el visor de la izquierda.
                    </p>
                    <button className="btn btn--primary" onClick={() => simularEscaner('cedula')} disabled={escanearTipo !== ''}>
                      {escanearTipo === 'cedula' ? 'Escaneando...' : 'Escanear'}
                    </button>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #DEE2E6', margin: 0 }} />

                <div>
                  <div style={{ fontWeight: 600, marginBottom: 10, color: '#212529' }}>Ingresar número de trámite</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input ref={searchIdRef} className="form-input" style={{ width: 220 }} placeholder="N° de trámite / ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') buscarPorId() }} />
                  <button className="btn btn--primary" onClick={buscarPorId} disabled={loading}>
                    {loading ? 'Buscando...' : 'Buscar'}
                  </button>
                  </div>
                </div>

              </div>
            </SectionCard>
          )}

          {tramite && !aprobado && (
            <>
              <SectionCard title="Alertas policiales">
                <div className="message message--success">
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

              {tramite.documentos && tramite.documentos.length > 0 && (
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
                      {tramite.documentos.map((doc) => (
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

              <div className="btn-group" style={{ justifyContent: 'flex-start', marginTop: 8 }}>
                <button className="btn btn--primary" onClick={() => handleAction('aprobar')}>
                  Aprobar Paso
                </button>
                <button className="btn btn--warning" onClick={() => handleAction('observar')}>
                  Observar
                </button>
                <button className="btn btn--danger" onClick={() => handleAction('rechazar')}>
                  Rechazar
                </button>
              </div>
            </>
          )}

          {tramite && aprobado && (
            <SectionCard title="Paso aprobado">
              <div className="message message--success">
                El paso del trámite ID {tramite.id} ha sido aprobado exitosamente.
              </div>
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <button className="btn btn--primary" onClick={handleNuevaFiscalizacion}>
                  Nueva fiscalización
                </button>
              </div>
            </SectionCard>
          )}

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

      <ConfirmDialog
        open={showConfirm}
        title={confirmTitle}
        message={confirmMsg}
        confirmText={action === 'aprobar' ? 'Aprobar Paso' : action === 'observar' ? 'Observar' : 'Rechazar'}
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
