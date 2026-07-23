import { useEffect, useState } from "react";
import {
  Camera,
  Upload,
  ImagePlus,
  MapPin,
  X,
} from "lucide-react";

export default function ProfileBanner({
  user,
  updateUser,
}) {
  const [banner, setBanner] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [uploadMode, setUploadMode] = useState("banner");
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user?.banner) {
      setBanner(user.banner);
    }

    if (user?.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
    }
  }, [user]);

  async function handleFile(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione apenas imagens.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async () => {
      const data = reader.result;

      try {
        const payload =
          uploadMode === "photo"
            ? { profilePhoto: data }
            : { banner: data };

        await fetch(
          `http://localhost:5000/api/users/${user.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (uploadMode === "photo") {
          setProfilePhoto(data);
        } else {
          setBanner(data);
        }

        updateUser(payload);
        setUploadError("");
        setShowModal(false);
      } catch {
        setUploadError(
          uploadMode === "photo"
            ? "Erro ao enviar foto de perfil."
            : "Erro ao enviar banner."
        );
      }
    };

    reader.readAsDataURL(file);
  }

  const initials =
    user?.username?.charAt(0).toUpperCase() || "N";

  return (
    <section className="profile-banner">

      <div
        className="profile-cover"
        style={{
          backgroundImage: banner
            ? `url(${banner})`
            : "linear-gradient(180deg,#4b4b4b,#2f2f2f)",
        }}
      >
        <div className="profile-cover-overlay">

          <button
            className="cover-button"
            onClick={() =>
              setShowModal(true)
            }
          >
            <Camera size={16} />
            Alterar banner
          </button>

        </div>
      </div>

      <div className="profile-header">

        <div
          className="profile-avatar"
          onClick={() => {
            setUploadMode("photo");
            setShowModal(true);
          }}
        >
          {profilePhoto ? (
            <img
              className="profile-avatar-circle"
              src={profilePhoto}
              alt={user?.username || "Perfil"}
            />
          ) : (
            <div className="profile-avatar-circle">
              {initials}
            </div>
          )}
        </div>

        <div className="profile-user">

          <h1>
            {user?.businessName ||
              user?.username}
          </h1>

          <span className="profile-profession">

            {user?.professionalTitle?.join(
              " • "
            ) ||
              "Profissional Criativo"}

          </span>

          <div className="profile-location">

            <MapPin size={15} />

            <span>
              {user?.country ||
                "Brasil"}
            </span>

          </div>

        </div>

      </div>

      {showModal && (
        <div
          className="banner-modal"
          onClick={() =>
            setShowModal(false)
          }
        >
          <div
            className="banner-modal-card"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="banner-modal-header">

              <div>

                <h3>
                  {uploadMode === "photo"
                    ? "Alterar foto de perfil"
                    : "Alterar banner"}
                </h3>

                <span>
                  {uploadMode === "photo"
                    ? "Use uma imagem quadrada para ficar perfeita no avatar."
                    : "Recomendado: 3200x410px"}
                </span>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
              >
                <X size={18} />
              </button>

            </div>

            <div className="banner-upload-switch">
              <button
                type="button"
                className={uploadMode === "banner" ? "active" : ""}
                onClick={() => setUploadMode("banner")}
              >
                Banner
              </button>
              <button
                type="button"
                className={uploadMode === "photo" ? "active" : ""}
                onClick={() => setUploadMode("photo")}
              >
                Foto
              </button>
            </div>

            <label className="banner-upload">

              <ImagePlus size={35} />

              <span>
                Clique para selecionar
              </span>

              <small>
                JPG PNG WEBP
              </small>

              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
              />

            </label>

            {uploadError && (
              <p className="upload-error">
                {uploadError}
              </p>
            )}

          </div>
        </div>
      )}

    </section>
  );
}