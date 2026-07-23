import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar2 from "../components/Navbar2";

import ProfileBanner from "../components/Perfil/ProfileBanner";
import SidebarProfile from "../components/Perfil/SidebarProfile";
import ProfileTabs from "../components/Perfil/ProfileTabs";

import Dashboard from "../components/Perfil/Dashboard/Dashboard";
import Services from "../components/Perfil/Services/Services";
import Finance from "../components/Perfil/Finance/Finance";
import Messages from "../components/Perfil/Messages/Messages";
import Social from "../components/Perfil/Social/Social";
import Statistics from "../components/Perfil/Statistics/Statistics";
import Settings from "../components/Perfil/Settings/Settings";

import "../css/Perfil.css";

export default function Perfil() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("nidus_user");

    if (!stored) {
      navigate("/landing");
      return;
    }

    const savedUser = JSON.parse(stored);

    fetch(`http://localhost:5000/api/users/${savedUser.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const current = data.user || savedUser;

        setUser(current);

        localStorage.setItem(
          "nidus_user",
          JSON.stringify(current)
        );
      })
      .catch(() => {
        setUser(savedUser);
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function updateUser(values) {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...values,
      };

      localStorage.setItem(
        "nidus_user",
        JSON.stringify(updated)
      );

      window.dispatchEvent(new Event("nidus-user-updated"));

      return updated;
    });
  }

  if (loading) {
    return (
      <>
        <Navbar2 />

        <div className="perfil-loading">
          <div className="perfil-loading-card">
            Carregando perfil...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar2 />

      <main className="perfil-page">

        <ProfileBanner
          user={user}
          updateUser={updateUser}
        />

        <ProfileTabs
          tab={tab}
          setTab={setTab}
        />

        <section className="perfil-main">

          <SidebarProfile
            user={user}
            setTab={setTab}
          />

          <div className="perfil-content">

            {tab === "dashboard" && (
              <Dashboard
                user={user}
              />
            )}

            {tab === "services" && (
              <Services
                user={user}
              />
            )}

            {tab === "finance" && (
              <Finance
                user={user}
              />
            )}

            {tab === "messages" && (
              <Messages
                user={user}
              />
            )}

            {tab === "social" && (
              <Social
                user={user}
              />
            )}

            {tab === "statistics" && (
              <Statistics
                user={user}
              />
            )}

            {tab === "settings" && (
              <Settings
                user={user}
                updateUser={updateUser}
              />
            )}

          </div>

        </section>

      </main>
    </>
  );
}