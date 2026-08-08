import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import "../css/FilterSection.css";

const CATEGORY_GROUPS = [
  {
    label: "Popular",
    items: [
      "Design de logotipo",
      "Serviços de identidade visual",
      "Design para redes sociais",
      "Web design",
      "Ilustrações",
      "Design de embalagem",
    ],
  },
  {
    label: "Design gráfico",
    items: [
      "Design de papelaria",
      "Design de pôster",
      "Design de identidade",
      "Diretrizes da marca",
    ],
  },
  {
    label: "Web e apps",
    items: ["Design de aplicativos", "UI/UX", "Landing Pages", "Ícones"],
  },
  {
    label: "Ilustração",
    items: ["Retratos", "Quadrinhos", "Personagens", "Ilustração 3D"],
  },
];

const TOOL_GROUPS = [
  {
    label: "Popular",
    items: ["Figma", "Photoshop", "Illustrator", "React", "Node.js", "Premiere"],
  },
  {
    label: "Mais usadas",
    items: ["After Effects", "Blender", "Canva", "InDesign", "Sketch", "Framer"],
  },
];

const COUNTRIES = ["Brasil", "Portugal"];

function FilterAccordion({ title, open, onToggle, count = 0, children }) {
  return (
    <section className="filter-section">
      <button
        type="button"
        className="filter-title"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="filter-title__row">
          {title}
          {count > 0 && <span className="filter-count">{count}</span>}
        </span>
        <ChevronDown size={16} strokeWidth={2.2} className={`filter-chevron ${open ? "open" : ""}`} />
      </button>
      <div className={`filter-body ${open ? "show" : ""}`}>
        <div className="filter-body__inner">{children}</div>
      </div>
    </section>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      className={`filter-chip ${active ? "active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FilterSection({ onFilterChange }) {
  const navigate = useNavigate();
  const [categoriasOpen, setCategoriasOpen] = useState(true);
  const [localizacaoOpen, setLocalizacaoOpen] = useState(true);
  const [ferramentasOpen, setFerramentasOpen] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllTools, setShowAllTools] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [city, setCity] = useState("");
  const [debouncedCity, setDebouncedCity] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedCity(city.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [city]);

  useEffect(() => {
    onFilterChange?.({
      categories: selectedCategories,
      country: selectedCountry,
      city: debouncedCity,
      tools: selectedTools,
    });
  }, [selectedCategories, selectedCountry, debouncedCity, selectedTools, onFilterChange]);

  function toggleValue(setter, value) {
    setter((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }

  function chooseCountry(country) {
    setSelectedCountry((prev) => (prev === country ? "" : country));
  }

  function resetFilters() {
    setSelectedCategories([]);
    setSelectedTools([]);
    setSelectedCountry("");
    setCity("");
  }

  const hasFilters =
    selectedCategories.length > 0 || selectedTools.length > 0 || selectedCountry || city.trim();

  const visibleCategories = showAllCategories ? CATEGORY_GROUPS : CATEGORY_GROUPS.slice(0, 1);
  const visibleTools = showAllTools ? TOOL_GROUPS : TOOL_GROUPS.slice(0, 1);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Filtros</h3>
        <button type="button" onClick={resetFilters} disabled={!hasFilters}>
          Limpar
        </button>
      </div>

      <button className="new-project" type="button" onClick={() => navigate("/perfil")}>
        <Plus size={16} strokeWidth={2.4} aria-hidden="true" />
        Novo projeto
      </button>

      <FilterAccordion
        title="Categorias"
        open={categoriasOpen}
        onToggle={() => setCategoriasOpen((open) => !open)}
        count={selectedCategories.length}
      >
        {visibleCategories.map((group) => (
          <div key={group.label} className="filter-group">
            <span className="filter-label">{group.label}</span>
            <div className="filter-chips">
              {group.items.map((item) => (
                <Chip
                  key={item}
                  active={selectedCategories.includes(item)}
                  onClick={() => toggleValue(setSelectedCategories, item)}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        ))}

        <button
          className="filter-more"
          type="button"
          onClick={() => setShowAllCategories((open) => !open)}
        >
          {showAllCategories ? "Menos categorias" : "Mais categorias"}
        </button>
      </FilterAccordion>

      <FilterAccordion
        title="Localização"
        open={localizacaoOpen}
        onToggle={() => setLocalizacaoOpen((open) => !open)}
        count={(selectedCountry ? 1 : 0) + (city.trim() ? 1 : 0)}
      >
        <div className="filter-group">
          <span className="filter-label">País</span>
          <div className="filter-chips">
            {COUNTRIES.map((country) => (
              <Chip
                key={country}
                active={selectedCountry === country}
                onClick={() => chooseCountry(country)}
              >
                {country}
              </Chip>
            ))}
          </div>
        </div>

        <label className="filter-group">
          <span className="filter-label">Cidade</span>
          <input
            type="text"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Ex.: São Paulo"
          />
        </label>
      </FilterAccordion>

      <FilterAccordion
        title="Ferramentas"
        open={ferramentasOpen}
        onToggle={() => setFerramentasOpen((open) => !open)}
        count={selectedTools.length}
      >
        {visibleTools.map((group) => (
          <div key={group.label} className="filter-group">
            <span className="filter-label">{group.label}</span>
            <div className="filter-chips">
              {group.items.map((item) => (
                <Chip
                  key={item}
                  active={selectedTools.includes(item)}
                  onClick={() => toggleValue(setSelectedTools, item)}
                >
                  {item}
                </Chip>
              ))}
            </div>
          </div>
        ))}

        <button
          className="filter-more"
          type="button"
          onClick={() => setShowAllTools((open) => !open)}
        >
          {showAllTools ? "Menos ferramentas" : "Mais ferramentas"}
        </button>
      </FilterAccordion>
    </aside>
  );
}

export default FilterSection;
