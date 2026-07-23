import Navbar2 from "../components/Navbar2";
import FilterSection from "../components/FilterSection";
import "../css/Home.css";
import Footer2 from "../components/Footer2"

function Home() {
  return (
    <div className="home-page">
      <Navbar2 />

      <div className="home-layout">
        <FilterSection />

        <main className="home-feed">
          <div className="feed-header">
            <h1>Feed</h1>
            <p>Os posts vão aparecer aqui depois.</p>
          </div>

          <section className="feed-empty">
            <div className="feed-empty-card">
              <span className="feed-empty-icon">◎</span>
              <h2>Nenhum post por enquanto</h2>
              <p>
                Quando você conectar o JSON dos posts, esse espaço será preenchido
                automaticamente.
              </p>
            </div>
          </section>
        </main>
        </div>
     <Footer2 /> 
    </div>
  );
}

export default Home;