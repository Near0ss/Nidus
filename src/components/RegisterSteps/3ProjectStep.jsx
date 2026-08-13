import { useRef, useState, useEffect } from "react";
import { Upload, DollarSign, Clock3, ChevronDown } from "lucide-react";

const MAX_PROJECT_IMAGES = 1;

function centsFromStored(value) {
  if (!value) return 0;
  const amount = Number(String(value).replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return Math.round(amount * 100);
}

function formatBRL(cents) {
  if (!cents) return "";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function ProjectStep({ data, updateField, nextStep, prevStep }) {
  const inputRef = useRef(null);

  const [dragging, setDragging] = useState(false);

  const [showDelivery, setShowDelivery] = useState(false);

  const deliveryRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (deliveryRef.current && !deliveryRef.current.contains(e.target)) {
        setShowDelivery(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const images = (data.projects || []).slice(0, MAX_PROJECT_IMAGES);

  const initialPrice = data.initialPrice || "";

  const deliveryTime = data.deliveryTime || "";

  function addFiles(files) {
    const valid = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, MAX_PROJECT_IMAGES);

    if (!valid.length) return;

    Promise.all(
      valid.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();

            reader.onload = () =>
              resolve({
                file,
                preview: reader.result,
              });

            reader.readAsDataURL(file);
          }),
      ),
    ).then((result) => {
      updateField("projects", result);
    });
  }

  function handleDrop(e) {
    e.preventDefault();

    setDragging(false);

    addFiles(e.dataTransfer.files);
  }

  const imagesValid = images.length === MAX_PROJECT_IMAGES;

  const priceCents = centsFromStored(initialPrice);
  const priceValid = priceCents > 0;

  const deliveryValid = deliveryTime.length > 0;

  const formValid = imagesValid && priceValid && deliveryValid;

  return (
    <div className="step-card project-step">
      <h1>Seu trabalho</h1>

      <p>Mostre a todos o estilo do seu trabalho</p>

      <div
        className={`project-upload ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
      >
        <Upload size={38} />

        <h3>Arraste uma imagem aqui</h3>

        <small>adicione 1 imagem do projeto</small>

        <input
          ref={inputRef}
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div className="project-progress">
        <span>{images.length}/1 imagem adicionada</span>

        <div className="project-progress-bar">
          <div
            className="project-progress-fill"
            style={{
              width: `${images.length * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="project-fields">
        <div className="project-input-icon">
          <DollarSign size={18} />

          <div className="price-input-wrap">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="R$ 0,00"
              value={formatBRL(priceCents)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                const cents = Number(digits || "0");
                updateField("initialPrice", cents ? (cents / 100).toFixed(2) : "");
              }}
              className={priceValid ? "valid-input" : ""}
            />
          </div>
        </div>

        <div className="project-input-icon">
          <Clock3 size={18} />

          <div className="custom-select" ref={deliveryRef}>
            <button
              type="button"
              className={`custom-select-trigger ${deliveryTime ? "" : "is-placeholder"}`}
              onClick={() => setShowDelivery(!showDelivery)}
            >
              {deliveryTime || "Prazo médio"}

              <ChevronDown className={showDelivery ? "rotate" : ""} size={18} />
            </button>

            {showDelivery && (
              <div className="custom-select-dropdown">
                {[
                  "1 dia",
                  "2 dias",
                  "3 dias",
                  "5 dias",
                  "1 semana",
                  "2 semanas",
                  "1 mês",
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      updateField("deliveryTime", item);

                      setShowDelivery(false);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
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
        className={`step-next-btn ${formValid ? "active" : ""}`}
        disabled={!formValid}
        onClick={nextStep}
      >
        <span>Continuar</span>
      </button>
    </div>
  );
}

export default ProjectStep;
