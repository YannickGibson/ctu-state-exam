import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';

const ERROR_MESSAGES = {
  state_mismatch: 'Login state mismatch. Please try again.',
  token_exchange_failed: 'FIT rejected the login. Please try again.',
  introspection_failed: 'Could not read your FIT identity. Please try again.',
  no_username: 'Your FIT account did not return a username.',
  user_create_failed: 'Could not create or look up your account.',
  link_generation_failed: 'Could not finalise the login.',
  unexpected: 'Something went wrong. Please try again.',
};

export default function FitCompletePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const err = params.get('error');
    if (err) {
      setError(ERROR_MESSAGES[err] || err);
      return;
    }
    const tokenHash = params.get('token_hash');
    if (!tokenHash) {
      setError('Missing login token.');
      return;
    }
    supabase.auth
      .verifyOtp({ type: 'magiclink', token_hash: tokenHash })
      .then(({ error: vErr }) => {
        if (vErr) setError(vErr.message);
        else navigate('/questions', { replace: true });
      });
  }, [params, navigate]);

  return (
    <div className="auth-card">
      <h1>Signing in with FIT…</h1>
      {error ? (
        <>
          <p className="error">{error}</p>
          <p className="muted">
            <Link to="/login">Back to login</Link>
          </p>
        </>
      ) : (
        <p className="muted">One moment…</p>
      )}
    </div>
  );
}
