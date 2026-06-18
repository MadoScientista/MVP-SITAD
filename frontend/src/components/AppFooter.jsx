import { Link } from 'react-router-dom'

export default function AppFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__grid">
          <div>
            <h4 className="site-footer__title">SITAD</h4>
            <Link className="site-footer__link" to="/ciudadano/dashboard">Inicio Ciudadano</Link>
            <Link className="site-footer__link" to="/funcionario/dashboard">Inicio Funcionarios</Link>
            <Link className="site-footer__link" to="/">Mapa del Sitio</Link>
          </div>
          <div>
            <h4 className="site-footer__title">Información</h4>
            <Link className="site-footer__link" to="/">Política de Privacidad</Link>
            <Link className="site-footer__link" to="/">Términos de Uso</Link>
            <Link className="site-footer__link" to="/">Accesibilidad</Link>
          </div>
          <div>
            <h4 className="site-footer__title">Contacto</h4>
            <span className="site-footer__link">Servicio Nacional de Aduanas</span>
            <span className="site-footer__link">Mesa Central: +56 2 2670 0000</span>
            <span className="site-footer__link">contacto@aduana.cl</span>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>&copy; {new Date().getFullYear()} SITAD — Sistema Integrado de Tramitación Aduanera Digital</span>
          <img
            className="site-footer__logo"
            src="/assets/images/logo-gob-footer.svg"
            alt="Gobierno de Chile"
          />
        </div>
      </div>
    </footer>
  )
}
