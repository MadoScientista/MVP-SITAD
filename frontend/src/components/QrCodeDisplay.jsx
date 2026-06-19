import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QrCodeDisplay({ data, size = 200 }) {
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

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `qr-aprobacion-${data.slice(0, 8)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} style={{ maxWidth: '100%', borderRadius: 8 }} />
      <div style={{ marginTop: 8 }}>
        <button className="btn btn--sm btn--secondary" onClick={handleDownload}>
          Descargar QR
        </button>
      </div>
    </div>
  )
}
