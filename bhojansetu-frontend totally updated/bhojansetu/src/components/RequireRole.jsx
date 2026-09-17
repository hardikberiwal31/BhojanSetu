import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/" replace />;
  if (role && session.role !== role) return <Navigate to="/" replace />;
  return children;
}
