const classMap = {
  PENDIENTE: 'status-badge--pendiente',
  PRE_VALIDADO_DIGITAL: 'status-badge--prevalidado',
  APROBADO_EN_VENTANILLA: 'status-badge--aprobado',
  RECHAZADO: 'status-badge--rechazado',
}

const labelMap = {
  PENDIENTE: 'Pendiente',
  PRE_VALIDADO_DIGITAL: 'Pre Validado',
  APROBADO_EN_VENTANILLA: 'Aprobado',
  RECHAZADO: 'Rechazado',
}

export default function StatusBadge({ estado }) {
  const cls = classMap[estado] || 'status-badge--pendiente'
  const label = labelMap[estado] || estado
  return <span className={`status-badge ${cls}`}>{label}</span>
}
