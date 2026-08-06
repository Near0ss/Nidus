import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function EditProfileModal({ user, onClose, updateUser }) {
  const [form, setForm] = useState({
    businessName: "",
    username: "",
    name: "",
    email: "",
    bio: "",
    country: "",
    state: "",
    availability: "",
    experience: "",
    socialLinks: {
      instagram: "",
      twitter: "",
      linkedin: "",
      facebook: ""
    }
  });

  const [bannerPreview, setBannerPreview] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      businessName: user.businessName || "",
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      country: user.country || "",
      state: user.state || "",
      availability: user.availability || "",
      experience: user.experience || "",
      socialLinks: {
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
        facebook: user.socialLinks?.facebook || ""
      }
    });

    setBannerPreview(user.banner || "");
    setPhotoPreview(user.profilePhoto || "");
  }, [user]);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setSocial(key, value) {
    setForm((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [key]: value
      }
    }));
  }

  function handleImageUpload(target, file) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("Selecione uma imagem válida.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (target === "banner") {
        setBannerPreview(dataUrl);
        setField("banner", dataUrl);
      } else {
        setPhotoPreview(dataUrl);
        setField("profilePhoto", dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);

    try {
      const payload = {
        country: form.country,
        state: form.state,
        bio: form.bio,
        availability: form.availability,
        experience: form.experience,
        socialLinks: form.socialLinks
      };

      if (user.type === "freelancer") {
        payload.businessName = form.businessName;
        payload.username = form.username;
        payload.profilePhoto = form.profilePhoto || photoPreview;
        payload.banner = form.banner || bannerPreview;
      } else {
        payload.name = form.name;
        payload.profilePhoto = form.profilePhoto || photoPreview;
      }

      const data = await apiFetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      updateUser(data.user);
      setStatus("Perfil atualizado com sucesso.");
      setTimeout(onClose, 700);
    } catch (err) {
      setStatus(err.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="edit-profile-modal" onClick={onClose}>
      <div className="edit-profile-card" onClick={(e) => e.stopPropagation()}>
        <div className="edit-profile-header">
          <div>
            <h3>Editar perfil</h3>
            <p>Atualize sua foto, banner e informações essenciais do perfil.</p>
          </div>
          <button onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="edit-profile-grid">
          <div className="edit-profile-block edit-profile-images">
            <label className="upload-block">
              <span>Banner</span>
              <div className="upload-preview banner-preview" style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : "none" }}>
                {!bannerPreview && <div className="upload-empty">Adicionar banner</div>}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload("banner", e.target.files?.[0])} />
            </label>

            <label className="upload-block">
              <span>Foto de perfil</span>
              <div className="upload-preview photo-preview">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto de perfil" />
                ) : (
                  <div className="upload-empty">Adicionar foto</div>
                )}
              </div>
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload("photo", e.target.files?.[0])} />
            </label>
          </div>

          <div className="edit-profile-block edit-profile-fields">
            {user.type === "freelancer" ? (
              <>
                <label>
                  Nome da empresa
                  <input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} />
                </label>
                <label>
                  Usuário
                  <input value={form.username} onChange={(e) => setField("username", e.target.value)} />
                </label>
              </>
            ) : (
              <label>
                Nome
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </label>
            )}

            <label>
              Email
              <input value={form.email} disabled />
            </label>

            <label>
              Biografia
              <textarea rows={3} value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
            </label>

            <label>
              País
              <input value={form.country} onChange={(e) => setField("country", e.target.value)} />
            </label>

            <label>
              Estado
              <input value={form.state} onChange={(e) => setField("state", e.target.value)} />
            </label>

            {user.type === "freelancer" && (
              <>
                <label>
                  Disponibilidade
                  <input value={form.availability} onChange={(e) => setField("availability", e.target.value)} placeholder="Livre / Ocupado / Em projeto" />
                </label>
                <label>
                  Experiência
                  <textarea rows={2} value={form.experience} onChange={(e) => setField("experience", e.target.value)} placeholder="Ex: 7 anos em branding" />
                </label>
              </>
            )}

            <div className="edit-profile-socials">
              <h4>Redes sociais</h4>
              <label>
                Instagram
                <input value={form.socialLinks.instagram} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="@seuusuario" />
              </label>
              <label>
                Twitter
                <input value={form.socialLinks.twitter} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="@seuusuario" />
              </label>
              <label>
                LinkedIn
                <input value={form.socialLinks.linkedin} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="linkedin.com/in/seuuser" />
              </label>
              <label>
                Facebook
                <input value={form.socialLinks.facebook} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="facebook.com/seuuser" />
              </label>
            </div>
          </div>
        </div>

        {status && <div className="edit-profile-status">{status}</div>}

        <div className="edit-profile-actions">
          <button className="btn-secondary outline" type="button" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}
