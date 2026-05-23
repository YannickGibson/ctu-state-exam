import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export default function RequireAuth({ children }) {
  const { session, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Spinner />;
  if (!session) return <Navigate to="/signup" state={{ from: location.pathname }} replace />;
  return children;
}
