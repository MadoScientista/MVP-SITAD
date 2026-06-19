import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'
import PageTitle from '../components/PageTitle'
import Breadcrumb from '../components/Breadcrumb'
import SectionCard from '../components/SectionCard'
import StatusBadge from '../components/StatusBadge'
import DataTable from '../components/DataTable'
import LoadingSpinner from '../components/LoadingSpinner'
import SidebarNav from '../components/SidebarNav'

const ESTADOS_VIAJE_ACTIVO = ['BORRADOR', 'PENDIENTE_DOCUMENTACION', 'PRE_VALIDADO_DIGITAL', 'OBSERVADO', 'APROBADO_EN_VENTANILLA']

export default function DashboardCiudadano() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [vehiculos, setVehiculos] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.get('/api/v1/vehicular/vehiculos').catch(() => []),
      api.get('/api/v1/vehicular/solicitudes').catch(() => []),
    ])
      .then(([v, s]) => {
        if (cancelled) return
        setVehiculos(Array.isArray(v) ? v : [])
        setSolicitudes(Array.isArray(s) ? s : [])
      })
      .catch(() => {
        if (!cancelled) setApiError('Error al cargar datos')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const hoy = new Date()
  const proximosViajes = solicitudes.filter((s) => {
    if (!s.fechaSalida) return false
    const salida = new Date(s.fechaSalida + (s.fechaSalida.includes('T') ? '' : 'T00:00:00'))
    return salida >= hoy && ESTADOS_VIAJE_ACTIVO.includes(s.estado)
  })

  const observacionesPendientes = solicitudes.filter((s) => s.estado === 'OBSERVADO')

  if (loading) return <LoadingSpinner />

  return (
    <div className="page-container">
      <Breadcrumb items={[{ label: 'Inicio' }]} />
      <PageTitle title={`Bienvenido, ${user?.nombre}`} subtitle="Panel ciudadano" />

      {apiError && <div className="message message--error">{apiError}</div>}

      <div className="two-column-layout">
        <div className="two-column-layout__main">
          <SectionCard>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Solicitar permiso para el ingreso o la salida temporal de un vehículo desde y hacia Argentina</h2>

            <div className="btn-group" style={{ justifyContent: 'center', marginTop: 32, marginBottom: 48 }}>
              <button className="btn btn--primary" onClick={() => navigate('/ciudadano/solicitudes/nueva')}>
                Iniciar solicitud
              </button>
            </div>

            <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: '#495057' }}>Descripción del trámite</h4>
            <p className="form-text">
              Este trámite permite a chilenos y extranjeros con residencia temporal o definitiva en Chile solicitar el ingreso o la salida temporal de un vehículo y su equipaje desde o hacia Argentina.
            </p>
            <p className="form-text">
              El proceso está libre del pago de derechos e impuestos para automóviles que retornen al país de origen antes de 90 días corridos (plazo máximo para que sea gratuito).
            </p>
            <p className="form-text">
              Adicionalmente, las personas deben efectuar el control migratorio a cargo de la Policía de Investigaciones (PDI) y el control fitozoosanitario del Servicio Agrícola y Ganadero (SAG).
            </p>
            <p className="form-text">
              En el caso de trámites realizados en la web de aduana, debe imprimir el formulario para ser presentado en el paso fronterizo de salida/ingreso al país.
            </p>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '16px 0 8px', color: '#495057' }}>Quién puede realizar o a quién está dirigido el trámite</h4>
            <p className="form-text">
              Chilenos y extranjeros con residencia temporal o definitiva en Chile o argentinos y chilenos con residencia en Argentina que salen desde Chile hacia Argentina, o que ingresan a Chile procedentes de Argentina, en sus vehículos particulares con fines de turismo.
            </p>
            <p className="form-text">
              También considera conductores de vehículos autorizados por sus propietarios.
            </p>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '16px 0 8px', color: '#495057' }}>Qué se necesita para hacer el trámite</h4>
            <ul style={{ paddingLeft: 24, fontSize: 15, color: '#212529', lineHeight: 1.8 }}>
              <li>Documento que acredite identidad del conductor,</li>
              <li>Si el conductor no es el dueño del vehículo, debe tener una autorización notarial extendida por el propietario,</li>
              <li>Documento que acredite propiedad del vehículo (Padrón), o documento que haga sus veces).</li>
              <li>Seguro obligatorio contra daños a terceros vigente.</li>
              <li>Contar con autorización por parte de la autoridad migratoria del país de destino, al momento de solicitar el ingreso del vehículo.</li>
            </ul>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '16px 0 8px', color: '#495057' }}>Documentación requerida</h4>
            <ol style={{ paddingLeft: 24, fontSize: 15, color: '#212529', lineHeight: 1.8 }}>
              <li>Antecedentes que acrediten identidad del conductor, y propiedad del vehículo.</li>
              <li>Poder notarial del propietario, en caso que el vehículo sea conducido por un tercero.</li>
              <li>Seguro de responsabilidad civil para daños a terceros, que puede adquirir en cualquier compañía de seguros.</li>
              <li>Si bien el Servicio Nacional de Aduanas de Chile no solicita el permiso de circulación y la revisión técnica, u otro documento similar, es importante tener la documentación al día para efectos de los controles realizados por Carabineros de Chile en la ruta.</li>
            </ol>

            <h4 style={{ fontSize: 16, fontWeight: 700, margin: '16px 0 8px', color: '#495057' }}>Aspectos a considerar</h4>
            <p className="form-text">
              Si una vez transcurrido el plazo de vigencia del régimen, el vehículo no ha realizado el retorno, los interesados deben regularizar el estado ante la Aduana más cercana.
            </p>
            <p className="form-text">
              El permiso tiene una vigencia de 90 días corridos, o el menor plazo entre lo otorgado por la Aduana del país de origen y por la autoridad migratoria del país de destino. Si una vez transcurrido este plazo, el vehículo no ha realizado el retorno, los interesados deben regularizar el estado del régimen ante la Aduana más cercana. El plazo de vigencia en territorio argentino es otorgado y comunicado por la autoridad aduanera de ese país.
            </p>
            <p className="form-text">
              Si bien el Servicio Nacional de Aduanas no solicita el permiso de circulación y la revisión técnica, u otro documento similar, es importante tener la documentación al día para efectos de los controles realizados por Carabineros de Chile en la ruta.
            </p>
            <p className="form-text">
              El trámite se puede realizar durante todo el año.
            </p>

            <div className="message message--info" style={{ marginTop: 12 }}>
              <strong>Costo del trámite:</strong> No tiene costo.
            </div>

            <div className="btn-group" style={{ justifyContent: 'center', marginTop: 24 }}>
              <button className="btn btn--primary" onClick={() => navigate('/ciudadano/solicitudes/nueva')}>
                Iniciar solicitud
              </button>
            </div>
          </SectionCard>

          {observacionesPendientes.length > 0 && (
            <SectionCard title="Observaciones pendientes">
              <p className="form-text" style={{ marginBottom: 12 }}>
                Los siguientes expedientes tienen observaciones del funcionario. Revise y corrija la información.
              </p>
              <DataTable
                columns={[
                  { label: 'Patente', key: 'patente' },
                  { label: 'Destino', key: 'paisDestino' },
                  { label: 'Observación', key: 'observacion' },
                  { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
                  { label: 'Acción', render: (r) => <button className="btn btn--sm btn--warning" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Corregir</button> },
                ]}
                data={observacionesPendientes}
                emptyMessage="Sin observaciones pendientes"
              />
            </SectionCard>
          )}

              <SectionCard title="Próximos viajes">
            <DataTable
              columns={[
                { label: 'Patente', key: 'patente' },
                { label: 'Destino', key: 'paisDestino' },
                { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
                { label: 'Salida', key: 'fechaSalida' },
                { label: 'Retorno', key: 'fechaRetorno' },
                { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
                { label: 'Acción', render: (r) => (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn--sm btn--primary" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>Ver</button>
                    {r.estado === 'APROBADO_EN_VENTANILLA' && r.codigoAprobacion && (
                      <button className="btn btn--sm btn--secondary" title="Ver código QR" onClick={() => navigate(`/ciudadano/expedientes/${r.id}`)}>QR</button>
                    )}
                  </div>
                )},
              ]}
              data={proximosViajes}
              emptyMessage="Sin viajes próximos"
            />
          </SectionCard>

          <SectionCard title="Solicitudes recientes">
            <DataTable
              columns={[
                { label: 'Patente', key: 'patente' },
                { label: 'Destino', key: 'paisDestino' },
                { label: 'Paso Fronterizo', key: 'pasoFronterizo' },
                { label: 'Salida', key: 'fechaSalida' },
                { label: 'Retorno', key: 'fechaRetorno' },
                { label: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
              ]}
              data={solicitudes.slice(0, 5)}
              emptyMessage="No has realizado solicitudes"
            />
          </SectionCard>

          {solicitudes.length > 5 && (
            <div className="text-center mt-16">
              <button className="btn btn--secondary" onClick={() => navigate('/ciudadano/solicitudes')}>
                Ver todas las solicitudes
              </button>
            </div>
          )}
        </div>

        <SidebarNav currentPath={location.pathname} />
      </div>
    </div>
  )
}
