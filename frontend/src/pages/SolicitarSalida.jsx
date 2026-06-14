import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import FormSection from '../components/FormSection'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'

const STEPS = [
  { num: 1, label: 'Conductor' },
  { num: 2, label: 'Vehículo' },
  { num: 3, label: 'Legitimidad' },
  { num: 4, label: 'Viaje' },
  { num: 5, label: 'Documentos' },
  { num: 6, label: 'Resumen' },
]

const TIPOS_DOC = ['PADRON', 'SEGURO_INTERNACIONAL', 'AUTORIZACION_NOTARIAL', 'PODER_ESPECIAL']

export default function SolicitarSalida() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [vehiculos, setVehiculos] = useState([])
  const [loadingVehiculos, setLoadingVehiculos] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    vehiculoId: '',
    esPropietario: 'si',
    autorizacion: '',
    fechaSalida: '',
    fechaRetorno: '',
    paisDestino: 'Argentina',
    pasoFronterizo: 'Los Libertadores',
  })

  const [documentos, setDocumentos] = useState([])
  const [nuevoDoc, setNuevoDoc] = useState({ nombre: '', tipo: 'PADRON', archivo: '' })

  useEffect(() => {
    api.get('/api/v1/vehicular/vehiculos')
      .then((v) => {
        setVehiculos(v)
        if (v.length > 0) setForm((f) => ({ ...f, vehiculoId: v[0].id }))
      })
      .catch(() => {})
      .finally(() => setLoadingVehiculos(false))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const agregarDocumento = () => {
    if (!nuevoDoc.nombre.trim() || !nuevoDoc.archivo.trim()) return
    setDocumentos([...documentos, { ...nuevoDoc }])
    setNuevoDoc({ nombre: '', tipo: 'PADRON', archivo: '' })
  }

  const eliminarDocumento = (idx) => {
    setDocumentos(documentos.filter((_, i) => i !== idx))
  }

  const canNext = () => {
    switch (step) {
      case 2: return !!form.vehiculoId
      case 4: return form.fechaSalida && form.fechaRetorno && form.paisDestino && form.pasoFronterizo
      default: return true
    }
  }

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      const solicitud = await api.post('/api/v1/vehicular/solicitudes', {
        vehiculoId: parseInt(form.vehiculoId, 10),
        fechaSalida: form.fechaSalida,
        fechaRetorno: form.fechaRetorno,
        paisDestino: form.paisDestino,
        pasoFronterizo: form.pasoFronterizo,
      })

      for (const doc of documentos) {
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

  return (
    <div className="page-container">
      <Breadcrumb items={[
        { label: 'Inicio', to: '/ciudadano/dashboard' },
        { label: 'Nueva solicitud' },
      ]} />
      <PageTitle title="Solicitar salida temporal" subtitle="Complete el expediente paso a paso" />

      <div className="wizard-steps">
        {STEPS.map((s) => (
          <div key={s.num} className={`wizard-step ${s.num === step ? 'wizard-step--active' : ''} ${s.num < step ? 'wizard-step--done' : ''}`}>
            <span className="wizard-step__num">{s.num}</span>
            <span className="wizard-step__label">{s.label}</span>
          </div>
        ))}
      </div>

      <ErrorMessage message={error} />

      {step === 1 && (
        <SectionCard title="Identificación del conductor">
          <FormSection>
            <div className="form-group">
              <label>RUT</label>
              <p className="form-text">{user?.rut || '—'}</p>
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <p className="form-text">{user?.nombre || '—'}</p>
            </div>
          </FormSection>
        </SectionCard>
      )}

      {step === 2 && (
        <SectionCard title="Selección del vehículo">
          <FormSection>
            <div className="form-group">
              <label htmlFor="vehiculoId">Vehículo <span className="required">*</span></label>
              <select id="vehiculoId" name="vehiculoId" className="form-select" value={form.vehiculoId} onChange={handleChange} required>
                {vehiculos.length === 0 && <option value="">No hay vehículos registrados</option>}
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.patente} - {v.marca} {v.modelo}</option>
                ))}
              </select>
            </div>
          </FormSection>
        </SectionCard>
      )}

      {step === 3 && (
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
              <div className="form-group">
                <label htmlFor="autorizacion">Antecedente que justifica el uso <span className="required">*</span></label>
                <textarea
                  id="autorizacion"
                  name="autorizacion"
                  className="form-input"
                  rows={3}
                  value={form.autorizacion}
                  onChange={handleChange}
                  placeholder="Ej: Autorización notarial, Poder especial..."
                  required
                />
              </div>
            )}
          </FormSection>
        </SectionCard>
      )}

      {step === 4 && (
        <SectionCard title="Datos del viaje">
          <FormSection>
            <div className="form-group">
              <label htmlFor="fechaSalida">Fecha de salida <span className="required">*</span></label>
              <input id="fechaSalida" name="fechaSalida" className="form-input" type="date" value={form.fechaSalida} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="fechaRetorno">Fecha de retorno <span className="required">*</span></label>
              <input id="fechaRetorno" name="fechaRetorno" className="form-input" type="date" value={form.fechaRetorno} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="paisDestino">País de destino <span className="required">*</span></label>
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
          </FormSection>
        </SectionCard>
      )}

      {step === 5 && (
        <SectionCard title="Documentación">
          <FormSection>
            <div className="form-group">
              <label>Tipo de documento</label>
              <select className="form-select" value={nuevoDoc.tipo} onChange={(e) => setNuevoDoc({ ...nuevoDoc, tipo: e.target.value })}>
                {TIPOS_DOC.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="docNombre">Nombre del documento</label>
              <input id="docNombre" className="form-input" value={nuevoDoc.nombre} onChange={(e) => setNuevoDoc({ ...nuevoDoc, nombre: e.target.value })} placeholder="Ej: Padrón vehículo" />
            </div>
            <div className="form-group">
              <label htmlFor="docArchivo">Referencia del archivo</label>
              <input id="docArchivo" className="form-input" value={nuevoDoc.archivo} onChange={(e) => setNuevoDoc({ ...nuevoDoc, archivo: e.target.value })} placeholder="Ej: padrón.pdf" />
            </div>
            <button type="button" className="btn btn--secondary" onClick={agregarDocumento} disabled={!nuevoDoc.nombre.trim() || !nuevoDoc.archivo.trim()}>
              Agregar documento
            </button>

            {documentos.length > 0 && (
              <div className="document-list" style={{ marginTop: 16 }}>
                <p className="form-text" style={{ fontWeight: 600 }}>Documentos agregados ({documentos.length})</p>
                {documentos.map((d, i) => (
                  <div key={i} className="document-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #DEE2E6' }}>
                    <span><strong>{d.nombre}</strong> — {d.tipo.replace(/_/g, ' ')} — {d.archivo}</span>
                    <button className="btn btn--sm btn--danger" onClick={() => eliminarDocumento(i)}>Eliminar</button>
                  </div>
                ))}
              </div>
            )}
          </FormSection>
        </SectionCard>
      )}

      {step === 6 && (
        <SectionCard title="Resumen del expediente">
          <FormSection>
            <div className="form-group">
              <label>Conductor</label>
              <p className="form-text">{user?.nombre} ({user?.rut})</p>
            </div>
            <div className="form-group">
              <label>Vehículo</label>
              <p className="form-text">
                {vehiculos.find((v) => v.id === parseInt(form.vehiculoId, 10))
                  ? `${vehiculos.find((v) => v.id === parseInt(form.vehiculoId, 10)).patente} — ${vehiculos.find((v) => v.id === parseInt(form.vehiculoId, 10)).marca} ${vehiculos.find((v) => v.id === parseInt(form.vehiculoId, 10)).modelo}`
                  : '—'}
              </p>
            </div>
            <div className="form-group">
              <label>Legitimidad</label>
              <p className="form-text">{form.esPropietario === 'si' ? 'Conductor es propietario' : `No es propietario — ${form.autorizacion}`}</p>
            </div>
            <div className="form-group">
              <label>Viaje</label>
              <p className="form-text">{form.paisDestino} — {form.pasoFronterizo} | {form.fechaSalida} → {form.fechaRetorno}</p>
            </div>
            <div className="form-group">
              <label>Documentos</label>
              <p className="form-text">{documentos.length > 0 ? documentos.map((d) => d.nombre).join(', ') : 'Sin documentos'}</p>
            </div>
          </FormSection>
        </SectionCard>
      )}

      <div className="btn-group">
        {step > 1 && (
          <button type="button" className="btn btn--secondary" onClick={() => setStep(step - 1)}>
            Anterior
          </button>
        )}
        {step < 6 ? (
          <button type="button" className="btn btn--primary" onClick={() => setStep(step + 1)} disabled={!canNext()}>
            Siguiente
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        )}
      </div>
    </div>
  )
}
