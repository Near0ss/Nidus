import { Link } from "react-router-dom";
import "../css/Footer2.css";
import logo from "../assets/logo.png";
import SocialLinks from "./SocialLinks";

function Footer2() {
  return (
    <footer className="footer2">
      <div className="footer2-left">
        <Link to="/landing" className="footer2-mark" aria-label="Nidus">
          <img src={logo} alt="" className="footer2-orb" />
        </Link>
        <Link to="/landing">Sobre</Link>
        <Link to="/home">Comunidade</Link>
        <a href="mailto:suporte@nidus.app">Ajuda</a>
      </div>
      <div className="footer2-right">
        <SocialLinks />
        <span className="language-selected">PT-BR</span>
      </div>
    </footer>
  );
}

export default Footer2;
