const classMap = {
  BORRADOR: 'status-badge--borrador',
  PENDIENTE: 'status-badge--pendiente',
  PENDIENTE_DOCUMENTACION: 'status-badge--pendiente-doc',
  PRE_VALIDADO_DIGITAL: 'status-badge--prevalidado',
  OBSERVADO: 'status-badge--observado',
  APROBADO_EN_VENTANILLA: 'status-badge--aprobado',
  RECHAZADO: 'status-badge--rechazado',
}

const labelMap = {
  BORRADOR: 'Borrador',
  PENDIENTE: 'Pendiente',
  PENDIENTE_DOCUMENTACION: 'Pendiente Doc.',
  PRE_VALIDADO_DIGITAL: 'Pre Validado',
  OBSERVADO: 'Observado',
  APROBADO_EN_VENTANILLA: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

export default function StatusBadge({ estado }) {
  const cls = classMap[estado] || 'status-badge--pendiente'
  const label = labelMap[estado] || estado
  return <span className={`status-badge ${cls}`}>{label}</span>
}
