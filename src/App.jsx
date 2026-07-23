import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthChoice from "./pages/AuthChoice";
import Register from "./pages/Register";
import Perfil from "./pages/Perfil";
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate to={localStorage.getItem("nidus_user") ? "/home" : "/landing"} />
          }
        />
        <Route path="/authchoice" element={<AuthChoice />} />

        <Route path="/register" element={<Register />} />

        <Route path="/perfil" element={<Perfil />} />

        <Route path="/home" element={<Home />} />

        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;