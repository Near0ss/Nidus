import "../css/Navbar.css";
import logo from "../assets/logotext.png";

function Navbar() {
  return (
    <nav className="nav-navbar">

      <div className="nav-navbar-container">

        <div className="nav-navbar-left">
          <img
            src={logo}
            alt="Nidus"
            className="nav-navbar-logo"
          />
        </div>

        <div className="nav-navbar-right">

          <div className="nav-dropdown">

            <button className="nav-button">
              Recursos
              <span className="nav-arrow">⌄</span>
            </button>

            <div className="nav-dropdown-menu">
              <a href="#">Visão geral</a>
              <a href="#">Guias de carreira</a>
              <a href="#">Projetos por encomenda</a>
              <a href="#">Aprendizagem criativa</a>
            </div>

          </div>

          <a href="#" className="nav-link">
            Explorar
          </a>

          <button className="nav-start-button">
            Start
          </button>

        </div>

      </div>

    </nav>
  );
}

export default Navbar;