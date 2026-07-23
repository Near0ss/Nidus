import { useState } from "react";
import "../css/FilterSection.css";

function FilterSection() {
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [localizacaoOpen, setLocalizacaoOpen] = useState(false);
  const [ferramentasOpen, setFerramentasOpen] = useState(false);


  return (
    <aside className="sidebar">

      <div className="sidebar-header">
        <h3>Filtros</h3>
        <button>Limpar</button>
      </div>

      <button className="new-project">
  <span>Novo Projeto</span>
</button>

      {/* CATEGORIAS */}

      <div className="filter-section">

        <div
          className="filter-title"
          onClick={() => setCategoriasOpen(!categoriasOpen)}
        >
          <span>Categorias</span>

          <span
            className={`arrow ${categoriasOpen ? "open" : ""}`}
          >
            ▼
          </span>
        </div>

        <div className={`filter-body ${categoriasOpen ? "show" : ""}`}>

          <div className="filter-content">

            <div className="category-group">

              <span className="category-title">
                Popular
              </span>

              <button className="category-item">
                • Design de logotipo
              </button>

              <button className="category-item">
                • Serviços de identidade visual
              </button>

              <button className="category-item">
                • Design para redes sociais
              </button>

              <button className="category-item">
                • Web design
              </button>

              <button className="category-item">
                • Ilustrações
              </button>

              <button className="category-item">
                • Design de embalagem
              </button>

            </div>

            <div
              className={`extra-categories ${showAllCategories ? "show" : ""
                }`}
            >

              <div className="category-group">

                <span className="category-title">
                  Design gráfico
                </span>

                <button className="category-item">
                  • Design de papelaria
                </button>

                <button className="category-item">
                  • Design de pôster
                </button>

                <button className="category-item">
                  • Design de identidade
                </button>

                <button className="category-item">
                  • Diretrizes da marca
                </button>

              </div>

              <div className="category-group">

                <span className="category-title">
                  Web e Apps
                </span>

                <button className="category-item">
                  • Design de aplicativos
                </button>

                <button className="category-item">
                  • UI/UX
                </button>

                <button className="category-item">
                  • Landing Pages
                </button>

                <button className="category-item">
                  • Ícones
                </button>

              </div>

              <div className="category-group">

                <span className="category-title">
                  Ilustração
                </span>

                <button className="category-item">
                  • Retratos
                </button>

                <button className="category-item">
                  • Quadrinhos
                </button>

                <button className="category-item">
                  • Personagens
                </button>

                <button className="category-item">
                  • Ilustração 3D
                </button>

              </div>

            </div>

            <button
              className="more-categories"
              onClick={() =>
                setShowAllCategories(!showAllCategories)
              }
            >
              {showAllCategories
                ? "▲ Menos categorias"
                : "▼ Mais categorias"}
            </button>

          </div>

        </div>

      </div>

      {/* LOCALIZAÇÃO */}

      <div className="filter-section">

        <div
          className="filter-title"
          onClick={() => setLocalizacaoOpen(!localizacaoOpen)}
        >
          <span>Localização</span>

          <span
            className={`arrow ${localizacaoOpen ? "open" : ""}`}
          >
            ▼
          </span>
        </div>

        <div
          className={`filter-body location-body ${localizacaoOpen ? "show" : ""
            }`}
        >
          <div className="location-content">

            <select>
              <option>País</option>
              <option>Brasil</option>
              <option>Portugal</option>
            </select>

            <input
              type="text"
              placeholder="Cidade"
            />

          </div>
        </div>

      </div>

      {/* FERRAMENTAS */}

      <div className="filter-section">

        <div
          className="filter-title"
          onClick={() => setFerramentasOpen(!ferramentasOpen)}
        >
          <span>Ferramentas</span>

          <span
            className={`arrow ${ferramentasOpen ? "open" : ""}`}
          >
            ▼
          </span>
        </div>

        <div
          className={`filter-body ${ferramentasOpen ? "show" : ""
            }`}
        >
          <div className="popular-tools">

            <button className="tool-item">React</button>
            <button className="tool-item">Node.js</button>
            <button className="tool-item">Photoshop</button>
            <button className="tool-item">Premiere</button>
            <button className="tool-item">Figma</button>
            <button className="tool-item">Illustrator</button>

            <button className="view-all-tools">
              Ver todas as ferramentas
            </button>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default FilterSection;