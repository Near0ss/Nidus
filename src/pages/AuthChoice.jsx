import { useState } from "react";
import Footer from "../components/Footer";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";
import logoText from "../assets/logotext.png";
import "../css/AuthChoice.css";

function AuthChoice() {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true" />

      <main className="auth-page">
        <div className="auth-container">
          <img src={logoText} alt="Nidus" className="auth-nidus" />

          <button
            type="button"
            className="auth-side user-side"
            onClick={() => navigate("/registeru")}
          >
            <div className="auth-content">
              <h1 className="auth-title">Usuário</h1>
              <div className="auth-features">
                <p>Descubra portfólios</p>
                <p>Contrate</p>
                <p>Salve profissionais</p>
                <p>Conecte-se</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className="auth-side freelancer-side"
            onClick={() => navigate("/register")}
          >
            <div className="auth-content right">
              <h1 className="auth-title">Freelancer</h1>
              <div className="auth-features">
                <p>Crie seu negócio</p>
                <p>Cresça</p>
                <p>Divulgue</p>
                <p>Organize</p>
              </div>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="already-account"
          onClick={() => setShowLogin(true)}
        >
          Já tem uma conta? <span>Entrar</span>
        </button>
      </main>

      <Footer />

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
}

export default AuthChoice;
