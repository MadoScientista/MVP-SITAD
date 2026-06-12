export default function FormSection({ title, subtitle, children }) {
  return (
    <div className="form-section">
      {title && <div className="form-section__title">{title}</div>}
      {subtitle && <div className="form-section__subtitle">{subtitle}</div>}
      <div className="form-grid">
        {children}
      </div>
    </div>
  )
}
