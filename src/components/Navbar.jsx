import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Navbar.css';
import logo from '../assets/logotext.png';

function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function closeAll() {
    setOpen(false);
  }

  return (
    <nav className="nav-navbar" aria-label="Principal">
      <div className="nav-navbar-container">
        <Link to="/landing" className="nav-navbar-left" onClick={closeAll}>
          <img src={logo} alt="Nidus" className="nav-navbar-logo" />
        </Link>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-expanded={open}
          aria-controls="nav-marketing-links"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Fechar' : 'Menu'}
        </button>

        <div id="nav-marketing-links" className={`nav-navbar-right ${open ? 'is-open' : ''}`}>
          <Link to="/home" className="nav-link" onClick={closeAll}>
            Explorar
          </Link>

          <button
            type="button"
            className="nav-start-button"
            onClick={() => {
              closeAll();
              navigate('/authchoice');
            }}
          >
            Começar
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
