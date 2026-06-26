export default function AlertModal({ open, title = 'Error', message, onClose }) {
  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="btn-group">
          <button className="btn btn--primary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  )
}
