import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import Spinner from './Spinner.jsx';

// Route gate that admits only the listed usernames. Mirrors the LeaderboardGate
// pattern in App.jsx. Note: this is UI-only — the matching /api/committee route
// re-checks the allowlist server-side, so a non-allowed user who forced the
// route still gets no data.
export default function RequireUsername({ allow, children }) {
  const { profile, ready } = useAuth();
  if (!ready || !profile) return <Spinner />;
  if (!allow.includes(profile.username)) return <Navigate to="/questions" replace />;
  return children;
}
