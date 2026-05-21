import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { validatePassword, validateUsername } from '../auth/validators.js';
import GitHubMark from '../components/GitHubMark.jsx';

// Password signup is hidden for now to avoid username collisions with FIT
// accounts. Flip to true to bring the form back.
const SHOW_PASSWORD_SIGNUP = false;

export default function SignupPage() {
  const { signUp, signIn } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const cleanUsername = username.trim().toLowerCase();
    const usernameErr = validateUsername(cleanUsername);
    if (usernameErr) {
      setError(usernameErr);
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }
    setBusy(true);
    try {
      await signUp(cleanUsername, password);
      try {
        await signIn(cleanUsername, password);
      } catch {
        navigate('/login', { replace: true });
        return;
      }
      navigate('/questions', { replace: true });
    } catch (err) {
      const msg = err.message || 'Signup failed.';
      if (/duplicate key|already (registered|exists)|profiles_username/i.test(msg)) {
        setError('That username is taken.');
      } else {
        setError(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2 className="auth-tagline">State Exam Practice and Organization</h2>
      <div className="auth-card">
        <h1>Create account</h1>
        <a className="auth-sso" href="/api/auth/fit/start">
          Sign in with FIT ČVUT
        </a>
        {SHOW_PASSWORD_SIGNUP && (
          <>
            <div className="auth-divider"><span>or</span></div>
            <form onSubmit={submit} className="auth-form">
              <label>
                Username
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <small className="muted">
                  3-32 chars, starts with a letter, lowercase a-z, digits, or underscore.
                </small>
              </label>
              <label>
                Password
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <small className="muted">At least 8 chars, must include a letter and a digit.</small>
              </label>
              {error && <p className="error">{error}</p>}
              <button type="submit" disabled={busy}>
                {busy ? 'Creating…' : 'Sign up'}
              </button>
            </form>
            <p className="muted">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </>
        )}
      </div>
      <a
        className="auth-oss"
        href="https://github.com/YannickGibson/ctu-state-exam"
        target="_blank"
        rel="noopener noreferrer"
      >
        <GitHubMark size={18} />
        <span>Open source on GitHub</span>
      </a>
    </>
  );
}
