export default function Statistics({ user }) {
  const views = user?.statistics?.views || 0;
  const reviews = user?.statistics?.reviews || 0;
  const projects = user?.projects?.length || 0;
  const posts = user?.posts?.length || user?.statistics?.posts || 0;

  return (
    <section className="perfil-section perfil-statistics u-rise">
      <div className="section-heading">
        <div>
          <h2>Estatísticas</h2>
          <p>Desempenho real do perfil. Sem métricas fake.</p>
        </div>
      </div>

      <div className="statistics-grid">
        <div className="stat-block">
          <strong>{views}</strong>
          <span>Visualizações</span>
        </div>
        <div className="stat-block">
          <strong>{reviews || '—'}</strong>
          <span>Avaliações</span>
        </div>
        <div className="stat-block">
          <strong>{projects}</strong>
          <span>Projetos</span>
        </div>
        <div className="stat-block">
          <strong>{posts}</strong>
          <span>Publicações</span>
        </div>
      </div>

      {views === 0 && reviews === 0 && (
        <div className="nidus-empty" style={{ marginTop: '1rem' }}>
          <strong>Ainda sem tração</strong>
          <p>Publique trabalho e compartilhe o perfil público para começar a medir.</p>
        </div>
      )}
    </section>
  );
}
