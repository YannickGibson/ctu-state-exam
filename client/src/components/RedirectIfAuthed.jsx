import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function RedirectIfAuthed({ children }) {
  const { session, ready } = useAuth();
  if (!ready) return <p className="muted">Loading…</p>;
  if (session) return <Navigate to="/questions" replace />;
  return children;
}
