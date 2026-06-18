import { Link } from 'react-router-dom'

export default function Breadcrumb({ items }) {
  return (
    <nav className="breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="breadcrumb__item">
          {item.to ? (
            <Link to={item.to}>{item.label}</Link>
          ) : (
            <span className="breadcrumb__item--current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
