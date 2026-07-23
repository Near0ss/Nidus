import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "../css/Navbar2.css";

import logo from "../assets/logotext.png";
import profilePlaceholder from "../assets/profile.jpg";
import notif from "../assets/notif.png";
import caixa from "../assets/mail.png";

export default function Navbar2() {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("nidus_user");

    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("nidus_user");
    navigate("/landing");
  }

  return (
    <nav className="navbar-navbar2">
      <div className="navbar-navbar2-container">

        {/* ESQUERDA */}

        <div className="navbar-navbar2-left">

          <img
            src={logo}
            alt="Logo"
            className="navbar-navbar2-logo"
          />

          <Link
            to="/perfil"
            className="navbar-nav-link navbar-nav-link-active"
          >
            Painel
          </Link>

          <Link
            to="/home"
            className="navbar-nav-link"
          >
            Projetos
          </Link>

          <Link
            to="/home"
            className="navbar-nav-link"
          >
            Freelancers
          </Link>

          <Link
            to="/home"
            className="navbar-nav-link"
          >
            Serviços
          </Link>

          <span className="navbar-nav-divider" />

          <div className="navbar-dropdown">

            <button
              type="button"
              className="navbar-dropdown-button"
            >
              Recursos

              <span className="navbar-dropdown-arrow">
                ⌄
              </span>
            </button>

            <div className="navbar-dropdown-menu">

              <a href="#">
                Tutoriais
              </a>

              <a href="#">
                Guias
              </a>

              <a href="#">
                Cursos
              </a>

              <a href="#">
                Carreiras
              </a>

            </div>

          </div>

        </div>

        {/* CENTRO */}

        <div className="navbar-navbar2-center">

          <input
            type="text"
            placeholder="Pesquisar projetos, usuários..."
            className="navbar-navbar2-search"
          />

        </div>

        {/* DIREITA */}

        <div className="navbar-navbar2-right">

          <img
            src={caixa}
            alt="Mensagens"
            className="navbar-icon"
          />

          <img
            src={notif}
            alt="Notificações"
            className="navbar-icon"
          />

          <div className="navbar-profile">

            <img
              src={user?.profilePhoto || profilePlaceholder}
              alt="Perfil"
              className="navbar-profile-avatar"
            />

            <div className="navbar-profile-menu">

              <div className="navbar-profile-header">

                <img
                  src={user?.profilePhoto || profilePlaceholder}
                  alt="Perfil"
                  className="navbar-profile-avatar-large"
                />

                <h3>
                  {user?.username || "Usuário"}
                </h3>

                <p>
                  {user?.email || "email@exemplo.com"}
                </p>

              </div>

              <button
                type="button"
                className="navbar-profile-upgrade"
                onClick={() => navigate("/perfil")}
              >
                Meu Perfil
              </button>

              <div className="navbar-profile-divider" />

              <Link to="/perfil">
                Perfil
              </Link>

              <Link to="/home">
                Projetos
              </Link>

              <Link to="/home">
                Serviços
              </Link>

              <Link to="/home">
                Relatórios
              </Link>

              <div className="navbar-profile-divider" />

              <button
                type="button"
                className="navbar-profile-logout"
                onClick={handleLogout}
              >
                Sair
              </button>

            </div>

          </div>

        </div>

      </div>
    </nav>
  );
}