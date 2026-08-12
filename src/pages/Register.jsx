import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "../css/Register.css";

import Login from "../components/Login";

import { ArrowLeft, Check } from "lucide-react";
import Background from "../assets/FundoStep1.png";
import PreviewBg from "../assets/Step3.png";
import FinalPreview from "../assets/LoginNidus.png";

import UserStep from "../components/RegisterSteps/1UserStep";
import ProfileStep from "../components/RegisterSteps/2ProfileStep";
import ProjectStep from "../components/RegisterSteps/3ProjectStep";
import FinalStep from "../components/RegisterSteps/4FinalStep";

import professionalSuggestions from "../data/professionalTitles";
import { coverForTitle } from "../data/professionCovers";
import { apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { normalizeUsername } from "../lib/username";

function Register() {
  const { login } = useAuth();
  const totalSteps = 4;

  const [step, setStep] = useState(1);

  const [showLogin, setShowLogin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const [success, setSuccess] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",

    businessName: "",
    professionalTitle: [],
    bio: "",
    country: "",
    state: "",

    projects: [],
    initialPrice: "",
    deliveryTime: "",
  });

  function nextStep() {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  }

  async function submitRegister() {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await apiFetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: String(formData.email || "").trim().toLowerCase(),
          username: normalizeUsername(formData.username),
        }),
      });

      if (data.user) {
        login(data.user, data.token);
        navigate('/perfil');
        return;
      }
      setSuccess('Conta criada com sucesso!');
      setFormData({
        email: "",
        username: "",
        password: "",
        businessName: "",
        professionalTitle: [],
        bio: "",
        country: "",
        state: "",
        projects: [],
        initialPrice: "",
        deliveryTime: "",
      });
      
      setTimeout(() => {
        setStep(1);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  const navigate = useNavigate();

  function updateField(name, value) {
    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? normalizeUsername(value) : value,
    }));
  }

  function toggleTitle(title) {
    const selected = formData.professionalTitle.includes(title);

    if (selected) {
      updateField(
        "professionalTitle",
        formData.professionalTitle.filter((t) => t !== title),
      );
      return;
    }

    if (formData.professionalTitle.length >= 5) return;

    updateField("professionalTitle", [...formData.professionalTitle, title]);
  }

  const steps = {
    1: (
      <UserStep
        data={formData}
        updateField={updateField}
        nextStep={nextStep}
        setShowLogin={setShowLogin}
      />
    ),

    2: (
      <ProfileStep
        data={formData}
        updateField={updateField}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    ),

    3: (
      <ProjectStep
        data={formData}
        updateField={updateField}
        nextStep={nextStep}
        prevStep={prevStep}
      />
    ),

    4: (
      <FinalStep
        data={formData}
        prevStep={prevStep}
        goToStep={setStep}
        onSubmit={submitRegister}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    ),
  };

  return (
    <main className="register-page">
      <div className="register-window">
        <section className="register-left">
          <div className="register-logo-area">
            <button
              type="button"
              className="register-back"
              onClick={() => (step === 1 ? navigate("/authchoice") : prevStep())}
            >
              <ArrowLeft size={18} strokeWidth={2.2} aria-hidden="true" />
              Voltar
            </button>
          </div>

          <div className="register-content">{steps[step]}</div>

          <div className="register-footer">
            <div className="register-progress-info">
              <p>
                Etapa {step} de {totalSteps}
              </p>
            </div>

            <div className="register-steps">
              {[1, 2, 3, 4].map((item) => (
                <span key={item} className={step >= item ? "active" : ""} />
              ))}
            </div>
          </div>
        </section>

        <section className="register-right">
          <div className="register-preview-card">
            <h2>Crie seu espaço profissional.</h2>

            <p>
              Mostre seu trabalho, conecte-se com clientes e gerencie seu
              negócio freelancer em um só lugar.
            </p>

            <div className="register-preview-content">
              <div
                className={`register-image-container ${
                  step === 2
                    ? "profession-mode"
                    : step === 3
                      ? "project-mode"
                      : ""
                }`}
              >
                {step === 2 ? (
                  <div className="profession-grid">
                    {professionalSuggestions.map((profession) => {
                      const selected = formData.professionalTitle.includes(profession.title);
                      const Icon = profession.icon;

                      return (
                        <div
                          key={profession.title}
                          role="button"
                          tabIndex={0}
                          className={`profession-card ${selected ? "selected" : ""}`}
                          onClick={() => toggleTitle(profession.title)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              toggleTitle(profession.title);
                            }
                          }}
                        >
                          <img
                            src={coverForTitle(profession.title)}
                            alt=""
                            className="profession-cover"
                            draggable="false"
                          />
                          <span className="profession-overlay" aria-hidden="true" />
                          <div className="profession-main">
                            <div className="profession-icon">
                              <Icon size={28} strokeWidth={2.35} />
                            </div>
                            <div className="profession-name">{profession.title}</div>
                          </div>
                          {selected ? (
                            <div className="profession-check">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : step === 3 ? (
                  <>
                    <img
                      src={PreviewBg}
                      alt=""
                      className="project-preview-background"
                    />

                    <div className="project-preview">
                      <div className="project-preview-row top">
                        <div className="project-preview-titles">
                          {formData.professionalTitle
                            .slice(0, 3)
                            .map((title) => (
                              <div
                                key={title}
                                className="project-preview-profession"
                              >
                                {title}
                              </div>
                            ))}
                        </div>

                        <div className="project-preview-images">
                          {Array.from({ length: 3 }).map((_, index) => {
                            const image = formData.projects?.[index];

                            return (
                              <div
                                key={index}
                                className="project-preview-image"
                              >
                                {image ? (
                                  <img src={image.preview} alt="" />
                                ) : (
                                  <div className="project-preview-placeholder" />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="project-preview-row bottom">
                        <div className="project-preview-images">
                          {Array.from({ length: 3 }).map((_, index) => {
                            const image = formData.projects?.[index + 3];

                            return (
                              <div
                                key={index}
                                className="project-preview-image"
                              >
                                {image ? (
                                  <img src={image.preview} alt="" />
                                ) : (
                                  <div className="project-preview-placeholder" />
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="project-preview-titles">
                          {formData.professionalTitle
                            .slice(3, 5)
                            .map((title) => (
                              <div
                                key={title}
                                className="project-preview-profession"
                              >
                                {title}
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : step === 4 ? (
                  <img
                    src={FinalPreview}
                    alt="Final Preview"
                    className="register-preview-image"
                  />
                ) : (
                  <img
                    src={Background}
                    alt="Preview"
                    className="register-preview-image"
                  />
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </main>
  );
}

export default Register;
