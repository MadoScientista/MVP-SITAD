import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import FormSection from '../components/FormSection'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import SidebarNav from '../components/SidebarNav'

const TIPOS_AUTORIZACION = ['AUTORIZACION_NOTARIAL', 'PODER_ESPECIAL']
const TIPOS_DOC_VEHICULO = ['PADRON', 'SEGURO_INTERNACIONAL']

export default function SolicitarSalida() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [vehiculos, setVehiculos] = useState([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    conductorRut: user?.rut || '',
    conductorNumeroDocumento: '',
    conductorNombre: user?.nombre || '',
    conductorApellidoPaterno: '',
    conductorApellidoMaterno: '',
    vehiculoId: '',
    esPropietario: '',
    tipoAutorizacion: '',
    fechaSalida: '',
    fechaRetorno: '',
    paisDestino: 'Argentina',
    pasoFronterizo: 'Los Libertadores',
  })

  const [documentosAutorizacion, setDocumentosAutorizacion] = useState([])
  const [documentosVehiculo, setDocumentosVehiculo] = useState([])
  const [nuevoDocAutorizacion, setNuevoDocAutorizacion] = useState({ nombre: '', tipo: 'AUTORIZACION_NOTARIAL', archivo: '' })
  const [nuevoDocVehiculo, setNuevoDocVehiculo] = useState({ nombre: '', tipo: 'PADRON', archivo: '' })

  useEffect(() => {
    api.get('/api/v1/vehicular/vehiculos')
      .then((v) => {
        setVehiculos(v)
        if (v.length > 0) setForm((f) => ({ ...f, vehiculoId: String(v[0].id) }))
      })
      .catch(() => {})
      .finally(() => setLoadingVehiculos(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const vehiculoSeleccionado = vehiculos.find((v) => String(v.id) === form.vehiculoId)

  const agregarDocumento = (list, setList, item, setItem) => {
    if (!item.nombre.trim() || !item.archivo.trim()) return
    setList([...list, { ...item }])
    setItem({ ...item, nombre: '', archivo: '' })
  }

  const eliminarDocumento = (list, setList, idx) => {
    setList(list.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const solicitud = await api.post('/api/v1/vehicular/solicitudes', {
        vehiculoId: parseInt(form.vehiculoId, 10),
        conductorRut: form.conductorRut,
        conductorNumeroDocumento: form.conductorNumeroDocumento || null,
        conductorNombre: form.conductorNombre,
        conductorApellidoPaterno: form.conductorApellidoPaterno || null,
        conductorApellidoMaterno: form.conductorApellidoMaterno || null,
        esPropietario: form.esPropietario === 'si',
        tipoAutorizacion: form.esPropietario === 'no' ? form.tipoAutorizacion : null,
        fechaSalida: form.fechaSalida,
        fechaRetorno: form.fechaRetorno,
        paisDestino: form.paisDestino,
        pasoFronterizo: form.pasoFronterizo,
      })

      const todosDocs = [...documentosAutorizacion, ...documentosVehiculo]
      for (const doc of todosDocs) {
        try {
          await api.post('/api/v1/vehicular/documentos', {
            solicitudId: solicitud.id,
            nombre: doc.nombre,
            tipo: doc.tipo,
            archivo: doc.archivo,
          })
        } catch {}
      }

      navigate('/ciudadano/solicitudes')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loadingVehiculos) return <LoadingSpinner />

  if (vehiculos.length === 0) {
    return (
      <div className="page-container">
        <Breadcrumb items={[
          { label: 'Inicio', to: '/ciudadano/dashboard' },
          { label: 'Nueva solicitud' },
        ]} />
        <PageTitle title="Solicitar salida temporal" subtitle="Complete el expediente" />
        <div className="message message--warning">
          No tiene vehículos inscritos. Para realizar una solicitud debe registrar al menos un vehículo.
        </div>
        <button className="btn btn--primary" onClick={() => navigate('/ciudadano/vehiculos/registrar')}>
          Ir a registrar vehículo
        </button>
      </div>
    )
  }

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Nueva solicitud' },
      ]} />
      <PageTitle title="Solicitar salida temporal" subtitle="Complete el expediente en esta pantalla" />

      <ErrorMessage message={error} />

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <SectionCard title="Identificación del conductor">
            <FormSection>
              <div className="form-group">
                <label htmlFor="conductorRut">RUN <span className="required">*</span></label>
                <input id="conductorRut" name="conductorRut" className="form-input" value={form.conductorRut} readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="conductorNumeroDocumento">N° de documento <span className="required">*</span></label>
                <input id="conductorNumeroDocumento" name="conductorNumeroDocumento" className="form-input" value={form.conductorNumeroDocumento} onChange={handleChange} placeholder="Documento de identidad" required />
              </div>
              <div className="form-group">
                <label htmlFor="conductorNombre">Nombres <span className="required">*</span></label>
                <input id="conductorNombre" name="conductorNombre" className="form-input" value="Juan" readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="conductorApellidoPaterno">Apellido paterno <span className="required">*</span></label>
                <input id="conductorApellidoPaterno" name="conductorApellidoPaterno" className="form-input" value="Pérez" readOnly required />
              </div>
              <div className="form-group">
                <label htmlFor="conductorApellidoMaterno">Apellido materno <span className="required">*</span></label>
                <input id="conductorApellidoMaterno" name="conductorApellidoMaterno" className="form-input" value="González" readOnly required />
              </div>
            </FormSection>
          </SectionCard>

          <SectionCard title="Identificación del vehículo">
            <FormSection>
              <div className="form-group">
                <label htmlFor="vehiculoId">Vehículo <span className="required">*</span></label>
                <select id="vehiculoId" name="vehiculoId" className="form-select" value={form.vehiculoId} onChange={handleChange} required>
                  {vehiculos.map((v) => (
                    <option key={v.id} value={v.id}>{v.patente} - {v.marca} {v.modelo} ({v.anio})</option>
                  ))}
                </select>
              </div>
              {vehiculoSeleccionado && (
                <div className="detail-grid" style={{ marginTop: 12 }}>
                  <div className="detail-item">
                    <span className="detail-item__label">Patente</span>
                    <span className="detail-item__value">{vehiculoSeleccionado.patente}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Marca / Modelo</span>
                    <span className="detail-item__value">{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">Año</span>
                    <span className="detail-item__value">{vehiculoSeleccionado.anio}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item__label">País Matrícula</span>
                    <span className="detail-item__value">{vehiculoSeleccionado.paisMatricula}</span>
                  </div>
                </div>
              )}
            </FormSection>
          </SectionCard>

          <SectionCard title="Legitimidad de uso">
            <FormSection>
              <div className="form-group">
                <label>¿El conductor es propietario del vehículo? <span className="required">*</span></label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="esPropietario" value="si" checked={form.esPropietario === 'si'} onChange={handleChange} />
                    Sí
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="esPropietario" value="no" checked={form.esPropietario === 'no'} onChange={handleChange} />
                    No
                  </label>
                </div>
              </div>
              {form.esPropietario === 'no' && (
                <>
                  <div className="form-group">
                    <label htmlFor="tipoAutorizacion">Documento que otorga el permiso <span className="required">*</span></label>
                    <select id="tipoAutorizacion" name="tipoAutorizacion" className="form-select" value={form.tipoAutorizacion} onChange={handleChange} required>
                      <option value="">Seleccione tipo</option>
                      {TIPOS_AUTORIZACION.map((t) => (
                        <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ marginTop: 12 }}>
                    <label>Adjuntar documento de autorización</label>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <input className="form-input" style={{ flex: 1 }} placeholder="Nombre del documento" value={nuevoDocAutorizacion.nombre} onChange={(e) => setNuevoDocAutorizacion({ ...nuevoDocAutorizacion, nombre: e.target.value })} />
                      <input className="form-input" style={{ flex: 1 }} placeholder="Archivo" value={nuevoDocAutorizacion.archivo} onChange={(e) => setNuevoDocAutorizacion({ ...nuevoDocAutorizacion, archivo: e.target.value })} />
                      <button type="button" className="btn btn--sm btn--secondary" onClick={() => agregarDocumento(documentosAutorizacion, setDocumentosAutorizacion, nuevoDocAutorizacion, setNuevoDocAutorizacion)} disabled={!nuevoDocAutorizacion.nombre.trim() || !nuevoDocAutorizacion.archivo.trim()}>
                        + Agregar
                      </button>
                    </div>
                    {documentosAutorizacion.length > 0 && (
                      <div className="document-list" style={{ marginTop: 12 }}>
                        {documentosAutorizacion.map((d, i) => (
                          <div key={i} className="document-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #DEE2E6' }}>
                            <span><strong>{d.nombre}</strong> — {d.tipo.replace(/_/g, ' ')} — {d.archivo}</span>
                            <button className="btn btn--sm btn--danger" onClick={() => eliminarDocumento(documentosAutorizacion, setDocumentosAutorizacion, i)}>Eliminar</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </FormSection>
          </SectionCard>

          <SectionCard title="Documentación del vehículo">
            <div className="form-section">
              <div className="drop-zone">
                <div className="drop-zone__icon">📄</div>
                <p className="drop-zone__text">
                  Arrastra aquí tu documento o <strong>selecciona un archivo</strong>
                </p>
                <p className="drop-zone__text" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                  Adjunte el padrón y el seguro internacional del vehículo.
                </p>
              </div>
              <div className="form-group">
                <label htmlFor="docTipo">Tipo de documento <span className="required">*</span></label>
                <select id="docTipo" className="form-select" value={nuevoDocVehiculo.tipo} onChange={(e) => setNuevoDocVehiculo({ ...nuevoDocVehiculo, tipo: e.target.value })}>
                  {TIPOS_DOC_VEHICULO.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="docNombre">Nombre del documento <span className="required">*</span></label>
                <input id="docNombre" className="form-input" placeholder="Ej: padrón" value={nuevoDocVehiculo.nombre} onChange={(e) => setNuevoDocVehiculo({ ...nuevoDocVehiculo, nombre: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="docArchivo">Archivo adjunto <span className="required">*</span></label>
                <input id="docArchivo" className="form-input" placeholder="URL o ruta del archivo" value={nuevoDocVehiculo.archivo} onChange={(e) => setNuevoDocVehiculo({ ...nuevoDocVehiculo, archivo: e.target.value })} />
              </div>
              <div className="btn-group" style={{ justifyContent: 'flex-start', marginTop: 0 }}>
                <button type="button" className="btn btn--sm btn--secondary" onClick={() => agregarDocumento(documentosVehiculo, setDocumentosVehiculo, nuevoDocVehiculo, setNuevoDocVehiculo)} disabled={!nuevoDocVehiculo.nombre.trim() || !nuevoDocVehiculo.archivo.trim()}>
                  + Agregar documento
                </button>
              </div>
              {documentosVehiculo.length > 0 && (
                <div className="document-list" style={{ marginTop: 12 }}>
                  {documentosVehiculo.map((d, i) => (
                    <div key={i} className="document-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #DEE2E6' }}>
                      <span><strong>{d.nombre}</strong> — {d.tipo.replace(/_/g, ' ')} — {d.archivo}</span>
                      <button className="btn btn--sm btn--danger" onClick={() => eliminarDocumento(documentosVehiculo, setDocumentosVehiculo, i)}>Eliminar</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Viaje">
            <FormSection>
              <div className="form-group">
                <label htmlFor="paisDestino">País destino <span className="required">*</span></label>
                <select id="paisDestino" name="paisDestino" className="form-select" value={form.paisDestino} onChange={handleChange} required>
                  <option value="Argentina">Argentina</option>
                  <option value="Perú">Perú</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Brasil">Brasil</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pasoFronterizo">Paso fronterizo <span className="required">*</span></label>
                <select id="pasoFronterizo" name="pasoFronterizo" className="form-select" value={form.pasoFronterizo} onChange={handleChange} required>
                  <option value="Los Libertadores">Los Libertadores</option>
                  <option value="Paso Pehuenche">Paso Pehuenche</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fechaSalida">Fecha salida <span className="required">*</span></label>
                <input id="fechaSalida" name="fechaSalida" className="form-input" type="date" value={form.fechaSalida} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="fechaRetorno">Fecha retorno <span className="required">*</span></label>
                <input id="fechaRetorno" name="fechaRetorno" className="form-input" type="date" value={form.fechaRetorno} onChange={handleChange} required />
              </div>
            </FormSection>
          </SectionCard>

          <SectionCard title="Resumen">
            <FormSection>
              <div className="form-group">
                <label>Conductor</label>
                <p className="form-text">
                  {form.conductorNombre} {form.conductorApellidoPaterno} {form.conductorApellidoMaterno} ({form.conductorRut})
                  {form.conductorNumeroDocumento ? ` — Doc: ${form.conductorNumeroDocumento}` : ''}
                </p>
              </div>
              <div className="form-group">
                <label>Vehículo</label>
                <p className="form-text">
                  {vehiculoSeleccionado
                    ? `${vehiculoSeleccionado.patente} — ${vehiculoSeleccionado.marca} ${vehiculoSeleccionado.modelo} (${vehiculoSeleccionado.anio})`
                    : '—'}
                </p>
              </div>
              <div className="form-group">
                <label>Documentos</label>
                <p className="form-text">
                  {documentosVehiculo.length > 0
                    ? `Vehículo: ${documentosVehiculo.map((d) => d.nombre).join(', ')}`
                    : 'Vehículo: Sin documentos'}
                  {documentosAutorizacion.length > 0
                    ? ` | Autorización: ${documentosAutorizacion.map((d) => d.nombre).join(', ')}`
                    : ''}
                </p>
              </div>
              <div className="form-group">
                <label>Viaje</label>
                <p className="form-text">{form.paisDestino} — {form.pasoFronterizo} | {form.fechaSalida} → {form.fechaRetorno}</p>
              </div>
            </FormSection>
          </SectionCard>

          <div className="btn-group">
            <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </div>
        </div>

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
