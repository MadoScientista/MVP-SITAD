import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export default function QrCodeDisplay({ data, size = 200, solicitud }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!data) return
    QRCode.toCanvas(canvasRef.current, data, {
      width: size,
      margin: 2,
      color: { dark: '#212529', light: '#FFFFFF' },
    })
  }, [data, size])

  if (!data) return null

  const handleDownloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-aprobacion-${data.slice(0, 8)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleDownloadPDF = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const imgData = canvas.toDataURL('image/png')
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageW = 210
    const leftMargin = 20
    const contentW = pageW - leftMargin * 2
    let y = 20

    const title = (text, opts = {}) => {
      doc.setFont('helvetica', opts.bold ? 'bold' : 'normal')
      doc.setFontSize(opts.size || 10)
      if (opts.color) doc.setTextColor(...opts.color)
      doc.text(text, leftMargin, y)
      if (opts.size === 16) y += 10
      else if (opts.size === 12) y += 7
      else y += 5
    }

    const field = (label, value) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(80, 80, 80)
      doc.text(label, leftMargin, y)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(value || '-', leftMargin + 50, y)
      y += 6
    }

    y = 20
    title('SITAD — Sistema Integrado de Tramitación Aduanera Digital', { size: 16, bold: true, color: [13, 110, 253] })
    title('Comprobante de Pre-Aprobación', { size: 12, bold: true })
    y += 2

    if (solicitud) {
      field('N° Expediente', `#${solicitud.id}`)
      field('RUT Conductor', solicitud.conductorRut)
      field('Nombre', [solicitud.conductorNombre, solicitud.conductorApellidoPaterno, solicitud.conductorApellidoMaterno].filter(Boolean).join(' '))
      if (solicitud.conductorNumeroDocumento) field('N° Documento', solicitud.conductorNumeroDocumento)
      field('Es propietario', solicitud.esPropietario ? 'Sí' : 'No')
      if (solicitud.tipoAutorizacion) field('Tipo autorización', solicitud.tipoAutorizacion.replace(/_/g, ' '))

      y += 2
      field('Patente', solicitud.patente)
      field('Marca / Modelo', `${solicitud.marca} ${solicitud.modelo}`)
      field('País destino', solicitud.paisDestino)
      field('Paso fronterizo', solicitud.pasoFronterizo)
      field('Fecha salida', solicitud.fechaSalida)
      field('Fecha retorno', solicitud.fechaRetorno)
      field('Fecha solicitud', solicitud.fechaSolicitud)
      field('Último cambio', solicitud.fechaEstado)
      field('Estado', solicitud.estado ? solicitud.estado.replace(/_/g, ' ') : '-')
      field('Código de aprobación', solicitud.codigoAprobacion || '-')

      y += 4
      const estadoStyle = (() => {
        if (solicitud.estado === 'PRE_VALIDADO_DIGITAL' || solicitud.estado === 'APROBADO_EN_VENTANILLA') return { text: '✔ APROBADO', color: [25, 135, 84] }
        return { text: solicitud.estado?.replace(/_/g, ' ') || '-', color: [108, 117, 125] }
      })()
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(...estadoStyle.color)
      doc.text(estadoStyle.text, leftMargin, y)
      y += 12

      if (solicitud.documentos && solicitud.documentos.length > 0) {
        y += 2
        title('Documentos adjuntos', { size: 12, bold: true })
        solicitud.documentos.forEach((doc, i) => {
          field(`${i + 1}. ${doc.nombre}`, `${doc.tipo.replace(/_/g, ' ')} — ${doc.fechaCreacion}`)
        })
      }
    }

    y += 6
    if (y > 250) {
      doc.addPage()
      y = 20
    }

    title('Código QR de aprobación', { size: 12, bold: true })
    const qrSize = 50
    const qrX = (pageW - qrSize) / 2
    doc.addImage(imgData, 'PNG', qrX, y, qrSize, qrSize)

    doc.save(`expediente-${solicitud?.id || 'unknown'}.pdf`)
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: 8 }} />
      <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button className="btn btn--sm btn--secondary" onClick={handleDownloadQR}>
          Descargar QR
        </button>
        {solicitud && (
          <button className="btn btn--sm btn--primary" onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
        )}
      </div>
    </div>
  )
}
