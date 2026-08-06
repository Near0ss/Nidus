import { useEffect, useState } from "react";
import "../css/FilterSection.css";

const categories = [
  "Design de logotipo",
  "Serviços de identidade visual",
  "Design para redes sociais",
  "Web design",
  "Ilustrações",
  "Design de embalagem",
  "Design de papelaria",
  "Design de pôster",
  "Design de identidade",
  "Diretrizes da marca",
  "Design de aplicativos",
  "UI/UX",
  "Landing Pages",
  "Ícones",
  "Retratos",
  "Quadrinhos",
  "Personagens",
  "Ilustração 3D"
];

const tools = [
  "React",
  "Node.js",
  "Photoshop",
  "Premiere",
  "Figma",
  "Illustrator"
];

const countries = ["Brasil", "Portugal"];

function FilterSection({ onFilterChange }) {
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [localizacaoOpen, setLocalizacaoOpen] = useState(false);
  const [ferramentasOpen, setFerramentasOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    onFilterChange?.({
      categories: selectedCategories,
      country: selectedCountry,
      city,
      tools: selectedTools
    });
  }, [selectedCategories, selectedCountry, city, selectedTools, onFilterChange]);

  function toggleCategory(category) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  }

  function toggleTool(tool) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((item) => item !== tool) : [...prev, tool]
    );
  }

  function resetFilters() {
    setSelectedCategories([]);
    setSelectedTools([]);
    setSelectedCountry("");
    setCity("");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filtros</h3>
        <button type="button" onClick={resetFilters}>
          Limpar
        </button>
      </div>

      <button className="new-project" type="button">
        <span>Novo Projeto</span>
      </button>

      {/* CATEGORIAS */}
      <div className="filter-section">
        <div
          className="filter-title"
          onClick={() => setCategoriasOpen(!categoriasOpen)}
        >
          <span>Categorias</span>
          <span className={`arrow ${categoriasOpen ? "open" : ""}`}>▼</span>
        </div>

        <div className={`filter-body ${categoriasOpen ? "show" : ""}`}>
          <div className="filter-content">
            <div className="category-group">
              <span className="category-title">Popular</span>
              {categories.slice(0, 6).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`category-item ${selectedCategories.includes(item) ? "active" : ""}`}
                  onClick={() => toggleCategory(item)}
                >
                  • {item}
                </button>
              ))}
            </div>

            <div className={`extra-categories ${showAllCategories ? "show" : ""}`}>
              <div className="category-group">
                <span className="category-title">Design gráfico</span>
                {categories.slice(6, 10).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`category-item ${selectedCategories.includes(item) ? "active" : ""}`}
                    onClick={() => toggleCategory(item)}
                  >
                    • {item}
                  </button>
                ))}
              </div>

              <div className="category-group">
                <span className="category-title">Web e Apps</span>
                {categories.slice(10, 14).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`category-item ${selectedCategories.includes(item) ? "active" : ""}`}
                    onClick={() => toggleCategory(item)}
                  >
                    • {item}
                  </button>
                ))}
              </div>

              <div className="category-group">
                <span className="category-title">Ilustração</span>
                {categories.slice(14).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`category-item ${selectedCategories.includes(item) ? "active" : ""}`}
                    onClick={() => toggleCategory(item)}
                  >
                    • {item}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="more-categories"
              type="button"
              onClick={() => setShowAllCategories(!showAllCategories)}
            >
              {showAllCategories ? "▲ Menos categorias" : "▼ Mais categorias"}
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
          <span className={`arrow ${localizacaoOpen ? "open" : ""}`}>▼</span>
        </div>

        <div className={`filter-body location-body ${localizacaoOpen ? "show" : ""}`}>
          <div className="location-content">
            <select
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
            >
              <option value="">País</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
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
          <span className={`arrow ${ferramentasOpen ? "open" : ""}`}>▼</span>
        </div>

        <div className={`filter-body ${ferramentasOpen ? "show" : ""}`}>
          <div className="popular-tools">
            {tools.map((tool) => (
              <button
                key={tool}
                type="button"
                className={`tool-item ${selectedTools.includes(tool) ? "active" : ""}`}
                onClick={() => toggleTool(tool)}
              >
                {tool}
              </button>
            ))}

            <button className="view-all-tools" type="button">
              Ver todas as ferramentas
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default FilterSection;