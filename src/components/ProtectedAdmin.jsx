import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function ProtectedAdmin({ children }) {
  const { authenticated, loading } = useAdminAuth();

  if (loading) return <div className="screen-loader">Checking admin session...</div>;
  if (!authenticated) return <Navigate to="/" replace/>;
  return children;
}
