import { useState, useRef } from "react";

function ProfileStep({
  data,
  updateField,
  nextStep,
  prevStep,
}) {
  const [showCountries, setShowCountries] =
    useState(false);

  const countryTimeout = useRef(null);

  function openCountries() {
    clearTimeout(countryTimeout.current);
    setShowCountries(true);
  }

  function closeCountries() {
    countryTimeout.current = setTimeout(() => {
      setShowCountries(false);
    }, 180);
  }

  const countries = [
    "Brasil",
    "Argentina",
    "Chile",
    "Uruguai",
    "Paraguai",
    "Bolívia",
    "Peru",
    "Colômbia",
    "Equador",
    "México",
    "Estados Unidos",
    "Canadá",
    "Portugal",
    "Espanha",
    "França",
    "Alemanha",
    "Itália",
    "Reino Unido",
    "Japão",
    "China",
    "Coreia do Sul",
    "Austrália",
  ];

  const businessValid =
    data.businessName.trim().length >= 3;

  const titleValid =
    data.professionalTitle.length > 0;

  const bioValid =
    data.bio.trim().length >= 30;

  const countryValid =
    data.country.length > 0;

  const stateValid =
    data.state.trim().length >= 2;

  const profileValid =
    businessValid &&
    titleValid &&
    bioValid &&
    countryValid &&
    stateValid;

  return (
    <div className="step-card">
      <div className="step-icon">
        ✦
      </div>

      <h1>Seu perfil</h1>

      <p>
        Conte aos clientes quem você é
        e o que você faz.
      </p>

      <div className="step-fields">

        <input
          className={
            businessValid ? "valid-input" : ""
          }
          type="text"
          placeholder="Nome do negócio"
          value={data.businessName}
          onChange={(e) =>
            updateField(
              "businessName",
              e.target.value
            )
          }
        />

        <div
          className={`selected-titles-container ${
            titleValid ? "valid-input" : ""
          }`}
        >
          {data.professionalTitle.length === 0 ? (
            <span className="placeholder">
              Escolha até 5 títulos →
            </span>
          ) : (
            data.professionalTitle.map((title) => (
              <button
                key={title}
                type="button"
                className="selected-title"
                onClick={() =>
                  updateField(
                    "professionalTitle",
                    data.professionalTitle.filter(
                      (t) => t !== title
                    )
                  )
                }
              >
                {title}
                <span>×</span>
              </button>
            ))
          )}
        </div>

        <textarea
          className={
            bioValid ? "valid-input" : ""
          }
          placeholder="Biografia"
          value={data.bio}
          onChange={(e) =>
            updateField(
              "bio",
              e.target.value
            )
          }
        />

        <div className="location-row">

          <div
            className="country-selector"
            onMouseEnter={openCountries}
            onMouseLeave={closeCountries}
          >

            <button
              type="button"
              className={`country-button ${
                countryValid
                  ? "valid-input"
                  : ""
              }`}
            >
              {data.country || "País"}
            </button>

            {showCountries && (
              <div
                className="country-popup"
                onMouseEnter={openCountries}
                onMouseLeave={closeCountries}
              >
                {countries.map((country) => (
                  <button
                    key={country}
                    type="button"
                    className="country-option"
                    onClick={() => {
                      updateField(
                        "country",
                        country
                      );

                      setShowCountries(false);
                    }}
                  >
                    {country}
                  </button>
                ))}
              </div>
            )}

          </div>

          <input
            className={
              stateValid ? "valid-input" : ""
            }
            type="text"
            placeholder="Estado"
            value={data.state}
            onChange={(e) =>
              updateField(
                "state",
                e.target.value
              )
            }
          />

        </div>

      </div>

      <button
        type="button"
        className="already-account-register"
        onClick={prevStep}
      >
        Voltar
      </button>

      <button
        className={`step-next-btn ${
          profileValid ? "active" : ""
        }`}
        disabled={!profileValid}
        onClick={nextStep}
      >
        <span>Continuar</span>
      </button>
    </div>
  );
}

export default ProfileStep;