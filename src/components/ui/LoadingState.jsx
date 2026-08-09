export default function LoadingState({ label = 'Carregando…' }) {
  return (
    <div className="nidus-loading" role="status">
      {label}
    </div>
  );
}
