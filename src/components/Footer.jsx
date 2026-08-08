import { Link } from "react-router-dom";
import "../css/Footer.css";
import logo from "../assets/logo.png";
import SocialLinks from "./SocialLinks";

function Footer() {
  return (
    <footer className="fot-footer">
      <div className="fot-footer-container">
        <Link to="/landing" className="fot-footer-left" aria-label="Nidus">
          <img src={logo} alt="" className="fot-main-logo" />
        </Link>

        <div className="fot-footer-right">
          <Link to="/home">Explorar</Link>
          <Link to="/authchoice">Começar</Link>
          <SocialLinks />
          <span className="fot-footer-language">PT-BR</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
