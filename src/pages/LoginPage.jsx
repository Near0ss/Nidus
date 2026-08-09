import { Navigate, useParams } from 'react-router-dom';
import Login from '../components/Login';

export default function LoginPage() {
  const { role } = useParams();
  if (role !== 'cliente' && role !== 'freelancer') {
    return <Navigate to="/authchoice" replace />;
  }
  return <Login asPage intendedRole={role === 'freelancer' ? 'FREELANCER' : 'CLIENT'} />;
}
