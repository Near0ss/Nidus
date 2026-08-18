import { useEffect, useState } from "react";
import {
  Camera,
  MapPin,
  Pencil,
  X,
  ImagePlus,
} from "lucide-react";
import { apiFetch, uploadFiles } from "../../lib/api";
import UserAvatar from "../ui/UserAvatar";

export default function ProfileBanner({
  user,
  updateUser,
  onEditProfile,
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

    try {
      const uploaded = await uploadFiles([file]);
      const url = uploaded.url || uploaded.urls?.[0];
      if (!url) throw new Error("Upload sem URL");
      const payload =
        uploadMode === "photo"
          ? { profilePhoto: url }
          : { banner: url };

      const data = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (uploadMode === "photo") setProfilePhoto(url);
      else setBanner(url);
      updateUser(data.user || payload);
      setUploadError("");
      setShowModal(false);
    } catch {
      setUploadError(
        uploadMode === "photo"
          ? "Erro ao enviar foto de perfil."
          : "Erro ao enviar banner."
      );
    }
  }

  const displayName =
    user?.type === "normal"
      ? user?.name || user?.username || "Usuário"
      : user?.businessName || user?.username || "Freelancer";
  const role =
    user?.type === "normal"
      ? "Contratante"
      : user?.professionalTitle?.join(" • ") || "Freelancer";

  return (
    <section className="perfil-hero">
      <div
        className={`profile-cover${banner ? "" : " is-default"}`}
        style={banner ? { backgroundImage: `url(${banner})` } : undefined}
      >
        <div className="profile-cover-overlay">
          <button
            type="button"
            className="cover-button"
            onClick={() => {
              setUploadMode("banner");
              setShowModal(true);
            }}
          >
            <Camera size={16} />
            Alterar banner
          </button>
        </div>
      </div>

      <div className="home-hero">
        <button
          type="button"
          className="home-hero__orb perfil-orb"
          onClick={() => {
            setUploadMode("photo");
            setShowModal(true);
          }}
          aria-label="Alterar foto de perfil"
        >
          <UserAvatar
            src={profilePhoto}
            name={displayName}
            size={88}
          />
        </button>

        <div className="home-hero__copy">
          <span className="u-eyebrow">{role}</span>
          <div className="perfil-hero__title-row">
            <h1>{displayName}</h1>
            {onEditProfile ? (
              <button type="button" className="home-btn ghost" onClick={onEditProfile}>
                <Pencil size={16} />
                Editar perfil
              </button>
            ) : null}
          </div>
          <p className="perfil-hero__meta">
            <MapPin size={14} />
            <span>
              {user?.country || "Brasil"}
              {user?.state ? ` · ${user.state}` : ""}
            </span>
          </p>
          <p className="perfil-hero__bio">
            {user?.bio || "Complete seu perfil para aparecer melhor no Nidus."}
          </p>
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
              className="banner-modal-close"
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