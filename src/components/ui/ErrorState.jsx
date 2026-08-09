export default function ErrorState({ message, onRetry }) {
  return (
    <div className="nidus-empty" role="alert">
      <strong>Não foi possível carregar</strong>
      <p>{message || 'Tente novamente em instantes.'}</p>
      {onRetry ? (
        <button type="button" className="home-btn ghost" onClick={onRetry}>
          Tentar de novo
        </button>
      ) : null}
    </div>
  );
}
