import "../css/Footer.css";

import logo from "../assets/logo.png";

import facebook from "../assets/facebook.png";
import instagram from "../assets/instagram.png";
import pinterest from "../assets/pintoreto.png";
import twitter from "../assets/twitter.png";
import whatsapp from "../assets/whatsapp.png";

function Footer() {
  return (
    <footer className="fot-footer">

      <div className="fot-footer-container">

        {/* ESQUERDA */}
        <div className="fot-footer-left">
          <img
            src={logo}
            alt="Logo"
            className="fot-main-logo"
          />
        </div>

        {/* DIREITA */}
        <div className="fot-footer-right">

          <a href="#">Ajuda</a>
          <a href="#">Suporte</a>

          <div className="fot-footer-socials">
            <img src={facebook} alt="" className="fot-social-icon" />
            <img src={twitter} alt="" className="fot-social-icon" />
            <img src={pinterest} alt="" className="fot-social-icon" />
            <img src={whatsapp} alt="" className="fot-social-icon" />
            <img src={instagram} alt="" className="fot-social-icon" />
          </div>

          <div className="fot-footer-language">
            <a href="#">English</a>
            <a href="#">PT-BR</a>
          </div>

          <span className="fot-footer-icon">◔</span>

        </div>

      </div>

    </footer>
  );
}

export default Footer;