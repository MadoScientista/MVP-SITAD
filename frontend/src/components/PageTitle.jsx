export default function PageTitle({ title, subtitle, children }) {
  return (
    <div className="page-title">
      <span className="title-accent" />
      <h1>{title} {children}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  )
}
