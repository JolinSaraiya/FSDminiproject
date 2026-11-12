import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from './Loading';

function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <Loading message="Verifying your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;

