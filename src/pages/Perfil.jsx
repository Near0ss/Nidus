import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Footer2 from "../components/Footer2";

import ProfileBanner from "../components/Perfil/ProfileBanner";
import ProfileTabs from "../components/Perfil/ProfileTabs";

import Dashboard from "../components/Perfil/Dashboard/Dashboard";
import Services from "../components/Perfil/Services/Services";
import Finance from "../components/Perfil/Finance/Finance";
import Messages from "../components/Perfil/Messages/Messages";
import Social from "../components/Perfil/Social/Social";
import Statistics from "../components/Perfil/Statistics/Statistics";
import Settings from "../components/Perfil/Settings/Settings";
import EditProfileModal from "../components/Perfil/EditProfileModal";

import "../css/Home.css";
import "../css/Perfil.css";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Perfil() {
  const navigate = useNavigate();
  const { user: authUser, updateUser: updateAuthUser } = useAuth();

  const [tab, setTab] = useState("dashboard");
  const [user, setUser] = useState(authUser);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!authUser?.id) {
      navigate("/authchoice");
      return;
    }

    apiFetch(`/api/users/${authUser.id}`)
      .then((data) => {
        const current = data.user || authUser;
        setUser(current);
        updateAuthUser(current);
        if (current.type === "normal") setTab("dashboard");
      })
      .catch(() => {
        setUser(authUser);
      });
  }, [authUser?.id, navigate, updateAuthUser]);

  function updateUser(values) {
    setUser((prev) => {
      const updated = { ...prev, ...values };
      updateAuthUser(updated);
      return updated;
    });
  }

  if (!user) return <div className="app-boot">Carregando perfil…</div>;

  return (
    <div className="perfil-page">

      <div className="perfil-layout">
        <main id="conteudo-principal" className="perfil-feed">
          <ProfileBanner
            user={user}
            updateUser={updateUser}
            onEditProfile={() => setShowEditModal(true)}
          />

          <ProfileTabs tab={tab} setTab={setTab} user={user} />

          {tab === "dashboard" && (
            <Dashboard
              user={user}
              onEditProfile={() => setShowEditModal(true)}
              onNewProject={() =>
                user?.type === "freelancer" ? setTab("services") : navigate("/home")
              }
            />
          )}

          {tab === "services" && user?.type === "freelancer" && (
            <Services user={user} updateUser={updateUser} />
          )}

          {tab === "finance" && user?.type === "freelancer" && (
            <Finance user={user} />
          )}

          {tab === "messages" && user?.type === "freelancer" && (
            <Messages user={user} />
          )}

          {tab === "social" && (
            <Social user={user} updateUser={updateUser} />
          )}

          {tab === "statistics" && user?.type === "freelancer" && (
            <Statistics user={user} />
          )}

          {tab === "settings" && (
            <Settings user={user} updateUser={updateUser} />
          )}
        </main>
      </div>

      <Footer2 />

      {showEditModal && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEditModal(false)}
          updateUser={(updated) => {
            setUser(updated);
            updateAuthUser(updated);
          }}
        />
      )}
    </div>
  );
}
