import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { apiFetch } from "../../lib/api";
import defaultBanner from "../../assets/fundo-wash.webp";

export default function EditProfileModal({ user, onClose, updateUser }) {
  const [form, setForm] = useState({
    businessName: "",
    username: "",
    name: "",
    email: "",
    bio: "",
    company: "",
    website: "",
    phone: "",
    hiringFocus: "",
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
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    setForm({
      businessName: user.businessName || "",
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      company: user.company || "",
      website: user.website || "",
      phone: user.phone || "",
      hiringFocus: user.hiringFocus || "",
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    overlayRef.current?.scrollTo(0, 0);

    function onKey(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

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
        website: form.website,
        socialLinks: form.socialLinks,
        profilePhoto: form.profilePhoto || photoPreview,
        banner: form.banner || bannerPreview,
      };

      if (user.type === "freelancer") {
        payload.businessName = form.businessName;
        payload.username = form.username;
        payload.availability = form.availability;
        payload.experience = form.experience;
      } else {
        payload.name = form.name;
        payload.company = form.company;
        payload.phone = form.phone;
        payload.hiringFocus = form.hiringFocus;
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

  return createPortal(
    <div className="edit-profile-modal" ref={overlayRef} onClick={onClose}>
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
          <label className="upload-block span-8">
            <span>Banner</span>
            <div
              className="upload-preview banner-preview"
              style={{ backgroundImage: `url(${bannerPreview || defaultBanner})` }}
            >
              {!bannerPreview && <div className="upload-empty">Banner padrão · clique para alterar</div>}
            </div>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("banner", e.target.files?.[0])} />
          </label>

          <label className="upload-block span-4">
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

          {user.type === "freelancer" ? (
            <>
              <label className="span-4">
                Nome da empresa
                <input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} />
              </label>
              <label className="span-4">
                Usuário
                <input value={form.username} onChange={(e) => setField("username", e.target.value)} />
              </label>
              <label className="span-4">
                Email
                <input value={form.email} disabled />
              </label>
            </>
          ) : (
            <>
              <label className="span-4">
                Nome
                <input value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </label>
              <label className="span-4">
                Email
                <input value={form.email} disabled />
              </label>
              <label className="span-4">
                Telefone
                <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </label>
              <label className="span-4">
                Empresa / organização
                <input value={form.company} onChange={(e) => setField("company", e.target.value)} />
              </label>
              <label className="span-8">
                O que você costuma contratar
                <input value={form.hiringFocus} onChange={(e) => setField("hiringFocus", e.target.value)} placeholder="Branding, site, motion..." />
              </label>
            </>
          )}

          <label className="span-4">
            Site / portfólio
            <input value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://" />
          </label>
          <label className="span-4">
            País
            <input value={form.country} onChange={(e) => setField("country", e.target.value)} />
          </label>
          <label className="span-4">
            Estado
            <input value={form.state} onChange={(e) => setField("state", e.target.value)} />
          </label>

          {user.type === "freelancer" ? (
            <label className="span-4">
              Disponibilidade
              <input value={form.availability} onChange={(e) => setField("availability", e.target.value)} placeholder="Livre / Ocupado / Em projeto" />
            </label>
          ) : null}

          <label className={user.type === "freelancer" ? "span-8" : "span-12"}>
            Bio
            <textarea rows={3} value={form.bio} onChange={(e) => setField("bio", e.target.value)} />
          </label>

          {user.type === "freelancer" ? (
            <label className="span-4">
              Experiência
              <textarea rows={3} value={form.experience} onChange={(e) => setField("experience", e.target.value)} placeholder="Ex: 7 anos em branding" />
            </label>
          ) : null}

          <h4 className="span-12 edit-profile-socials-title">Redes sociais</h4>
          <label className="span-3">
            Instagram
            <input value={form.socialLinks.instagram} onChange={(e) => setSocial("instagram", e.target.value)} placeholder="@seuusuario" />
          </label>
          <label className="span-3">
            Twitter
            <input value={form.socialLinks.twitter} onChange={(e) => setSocial("twitter", e.target.value)} placeholder="@seuusuario" />
          </label>
          <label className="span-3">
            LinkedIn
            <input value={form.socialLinks.linkedin} onChange={(e) => setSocial("linkedin", e.target.value)} placeholder="linkedin.com/in/seuuser" />
          </label>
          <label className="span-3">
            Facebook
            <input value={form.socialLinks.facebook} onChange={(e) => setSocial("facebook", e.target.value)} placeholder="facebook.com/seuuser" />
          </label>
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
    </div>,
    document.body,
  );
}
