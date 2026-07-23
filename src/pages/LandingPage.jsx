import "../css/LandingPage.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  function handleStart() {
    const user = localStorage.getItem("nidus_user");
    if (user) navigate("/home");
    else navigate("/authchoice");
  }

  return (
    <div className="landing-page">

      {/* BACKGROUND */}
      <div className="background-image"></div>

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <div className="hero-content">

        <img
          src="/centerlogo.png"
          alt=""
          className="hero-logo"
        />

        <h1>
          Sua carreira, em um único ninho
        </h1>

        <button className="hero-button" onClick={handleStart}>
          começar agora
        </button>

      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  );
}

export default LandingPage;