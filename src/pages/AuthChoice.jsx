import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import logoText from "../assets/logotext.png";
import "../css/AuthChoice.css";

function AuthChoice() {
  const navigate = useNavigate();

  return (
    <div className="auth-shell">
      <div className="auth-bg" aria-hidden="true" />

      <main className="auth-page">
        <p className="auth-kicker">Entrar no Nidus</p>
        <p className="auth-question">Como você usa o Nidus?</p>
        <div className="auth-container">
          <img src={logoText} alt="Nidus" className="auth-nidus" />

          <button
            type="button"
            className="auth-side user-side"
            onClick={() => navigate("/login/cliente")}
          >
            <div className="auth-content">
              <h1 className="auth-title">Cliente</h1>
              <div className="auth-features">
                <p>Encontre profissionais</p>
                <p>Contrate serviços</p>
                <p>Acompanhe trabalhos</p>
                <p>Conecte-se</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            className="auth-side freelancer-side"
            onClick={() => navigate("/login/freelancer")}
          >
            <div className="auth-content right">
              <h1 className="auth-title">Freelancer</h1>
              <div className="auth-features">
                <p>Divulgue seus serviços</p>
                <p>Gerencie sua carreira</p>
                <p>Converse com clientes</p>
                <p>Acompanhe resultados</p>
              </div>
            </div>
          </button>
        </div>

        <p className="already-account auth-footnote">
          Ainda não tem conta? Escolha o tipo acima e depois crie a sua.
        </p>
      </main>

      <Footer />
    </div>
  );
}

export default AuthChoice;
