export default function DataTable({ columns, data, emptyMessage = 'No hay registros' }) {
  if (!data || data.length === 0) {
    return <p style={{ color: '#6C757D', padding: '24px', textAlign: 'center' }}>{emptyMessage}</p>
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, ri) => (
          <tr key={ri}>
            {columns.map((col, ci) => (
              <td key={ci}>{col.render ? col.render(row) : row[col.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
