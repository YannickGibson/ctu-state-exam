import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import QuestionsPage from './pages/QuestionsPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import QuizzesPage from './pages/QuizzesPage.jsx';
import QuizSelectionPage from './pages/QuizSelectionPage.jsx';
import QuizRunnerPage from './pages/QuizRunnerPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import GitHubMark from './components/GitHubMark.jsx';
import { useAuth } from './auth/AuthContext.jsx';

function Header() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <span className="app-title">State Exams</span>
      <nav>
        <NavLink to="/questions" end>Questions</NavLink>
        <NavLink to="/quizzes" end>Quizzes</NavLink>
        {profile?.show_leaderboard && (
          <NavLink to="/leaderboard">Leaderboard</NavLink>
        )}
      </nav>
      <div className="header-spacer" />
      {session && (
        <div className="header-user">
          <a
            className="header-oss"
            href="https://github.com/YannickGibson/ctu-state-exams"
            target="_blank"
            rel="noopener noreferrer"
            title="Open source on GitHub"
            aria-label="Open source on GitHub"
          >
            <GitHubMark size={18} />
          </a>
          <span className="muted">{profile?.username || '…'}</span>
          <button className="ghost" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      )}
    </header>
  );
}

function LeaderboardGate({ children }) {
  const { profile, ready } = useAuth();
  if (!ready || !profile) return <p className="muted">Loading…</p>;
  if (!profile.show_leaderboard) return <Navigate to="/questions" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<Navigate to="/questions" replace />} />
          <Route
            path="/questions"
            element={
              <RequireAuth>
                <QuestionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/questions/:id"
            element={
              <RequireAuth>
                <QuestionDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quizzes"
            element={
              <RequireAuth>
                <QuizzesPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quizzes/:subject"
            element={
              <RequireAuth>
                <QuizSelectionPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quizzes/:subject/:scope"
            element={
              <RequireAuth>
                <QuizRunnerPage />
              </RequireAuth>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireAuth>
                <LeaderboardGate>
                  <LeaderboardPage />
                </LeaderboardGate>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/questions" replace />} />
        </Routes>
      </main>
    </div>
  );
}
