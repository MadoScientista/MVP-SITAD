export default function SectionCard({ title, children, className = '' }) {
  return (
    <div className={`card ${className}`}>
      {title && <div className="card__title">{title}</div>}
      {children}
    </div>
  )
}
