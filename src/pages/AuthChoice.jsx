import { useState } from "react";
import Footer from "../components/Footer";
import Login from "../components/Login";
import { useNavigate } from "react-router-dom";
import "../css/AuthChoice.css";

function AuthChoice() {

  const [showLogin, setShowLogin] = useState(false);

  const navigate = useNavigate();

  return (
    <>
      <main className="auth-page">

        <div className="auth-container">

          {/* USUÁRIO */}

          {/* USUÁRIO */}

          <div
            className="auth-side user-side"
            onClick={() => navigate("/registeru")}
          >

            <div className="auth-content">

              <h1 className="auth-title">
                Usuário
              </h1>

              <div className="auth-features">
                <p>Descubra portfólios</p>
                <p>Contrate</p>
                <p>Favorite</p>
                <p>Explore</p>
              </div>

            </div>

          </div>

          {/* FREELANCER */}

          <div
            className="auth-side freelancer-side"
            onClick={() => navigate("/register")}
          >

            <div className="auth-content right">

              <h1 className="auth-title">
                Freelancer
              </h1>

              <div className="auth-features">
                <p>Crie seu negócio</p>
                <p>Cresça</p>
                <p>Divulgue</p>
                <p>Organize</p>
              </div>

            </div>

          </div>

        </div>

        <button
          className="already-account"
          onClick={() => setShowLogin(true)}
        >
          Já tem uma conta?
        </button>

      </main>

      <Footer />

      {showLogin && (
        <Login
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}

export default AuthChoice;