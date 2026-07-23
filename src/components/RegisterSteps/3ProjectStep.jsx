import { useRef, useState, useEffect } from "react";
import { Upload, Trash2, DollarSign, Clock3, ChevronDown } from "lucide-react";

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

  const images = data.projects || [];

  const description = data.projectDescription || "";

  const initialPrice = data.initialPrice || "";

  const deliveryTime = data.deliveryTime || "";

  function addFiles(files) {
    const valid = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .slice(0, 6 - images.length);

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
      updateField("projects", [...images, ...result]);
    });
  }

  function handleDrop(e) {
    e.preventDefault();

    setDragging(false);

    addFiles(e.dataTransfer.files);
  }

  function removeImage(index) {
    updateField(
      "projects",
      images.filter((_, i) => i !== index),
    );
  }

  const imagesValid = images.length >= 2;

  const priceValid = Number(initialPrice) > 0;

  const deliveryValid = deliveryTime.length > 0;

  const formValid = imagesValid && priceValid && deliveryValid;

  return (
    <div className="step-card project-step">
      <div className="step-icon">✣</div>

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

        <h3>Arraste imagens aqui</h3>

        <small>mínimo 2 • máximo 6 imagens</small>

        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      <div className="project-progress">
        <span>{images.length}/6 imagens adicionadas</span>

        <div className="project-progress-bar">
          <div
            className="project-progress-fill"
            style={{
              width: `${(images.length / 6) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="project-fields">
        <div className="project-input-icon">
          <DollarSign size={18} />

          <input
            type="number"
            placeholder="Preço inicial (R$)"
            value={initialPrice}
            onChange={(e) => updateField("initialPrice", e.target.value)}
            className={priceValid ? "valid-input" : ""}
          />
        </div>

        <div className="project-input-icon">
          <Clock3 size={18} />

          <div className="custom-select" ref={deliveryRef}>
            <button
              type="button"
              className="custom-select-trigger"
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
