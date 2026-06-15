import { useNavigate } from 'react-router-dom'

const LINKS = [
  { label: 'Solicitar ingreso o salida temporal de vehículo', path: '/ciudadano/solicitudes/nueva' },
  { label: 'Mis vehículos', path: '/ciudadano/vehiculos' },
  { label: 'Mis solicitudes', path: '/ciudadano/solicitudes' },
]

export default function SidebarNav({ currentPath, extraLinks }) {
  const navigate = useNavigate()

  return (
    <aside className="sidebar-nav">
      <div className="sidebar-nav__title">Navegación</div>
      {[...LINKS, ...(extraLinks || [])].map((link) => (
        <button
          key={link.path}
          className={`sidebar-nav__btn ${currentPath === link.path ? 'sidebar-nav__btn--active' : ''}`}
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </button>
      ))}
      <button className="sidebar-nav__btn sidebar-nav__btn--back" onClick={() => navigate(-1)}>
        Volver atrás
      </button>
    </aside>
  )
}
