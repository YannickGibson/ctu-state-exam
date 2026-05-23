import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Spinner from './Spinner.jsx';

export default function RedirectIfAuthed({ children }) {
  const { session, ready } = useAuth();
  if (!ready) return <Spinner />;
  if (session) return <Navigate to="/questions" replace />;
  return children;
}
