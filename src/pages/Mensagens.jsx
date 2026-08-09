import { Navigate, useSearchParams } from 'react-router-dom';

export default function Mensagens() {
  const [params] = useSearchParams();
  const qs = params.toString();
  return <Navigate to={`/dashboard/messages${qs ? `?${qs}` : ''}`} replace />;
}
