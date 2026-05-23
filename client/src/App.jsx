import { Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import QuestionsPage from './pages/QuestionsPage.jsx';
import QuestionDetailPage from './pages/QuestionDetailPage.jsx';
import MarkdownViewerPage from './pages/MarkdownViewerPage.jsx';
import QuizzesPage from './pages/QuizzesPage.jsx';
import QuizSelectionPage from './pages/QuizSelectionPage.jsx';
import QuizRunnerPage from './pages/QuizRunnerPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import PodcastPage from './pages/PodcastPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import FitCompletePage from './pages/FitCompletePage.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import RedirectIfAuthed from './components/RedirectIfAuthed.jsx';
import GitHubMark from './components/GitHubMark.jsx';
import { useAuth } from './auth/AuthContext.jsx';
import Spinner from './components/Spinner.jsx';

function Header() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/login', { replace: true });
  }

  return (
    <header className="app-header">
      <div className="app-brand">
        <img className="app-logo" src="/icon-512.png" alt="" width="28" height="28" />
        <span className="app-title">Practice and Organization</span>
      </div>
      {session && (
        <nav>
          <NavLink to="/questions" end>Questions</NavLink>
          <NavLink to="/quizzes" end>Quizzes</NavLink>
          <NavLink to="/podcast">Podcast</NavLink>
          {profile?.show_leaderboard && (
            <NavLink to="/leaderboard">Leaderboard</NavLink>
          )}
        </nav>
      )}
      <div className="header-spacer" />
      {session && (
        <div className="header-user">
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
  if (!ready || !profile) return <Spinner />;
  if (!profile.show_leaderboard) return <Navigate to="/questions" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app-main">
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuthed>
                <LoginPage />
              </RedirectIfAuthed>
            }
          />
          <Route
            path="/signup"
            element={
              <RedirectIfAuthed>
                <SignupPage />
              </RedirectIfAuthed>
            }
          />
          <Route path="/auth/fit/complete" element={<FitCompletePage />} />
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
            path="/questions/:slug"
            element={
              <RequireAuth>
                <QuestionDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/md-viewer"
            element={
              <RequireAuth>
                <MarkdownViewerPage />
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
            path="/podcast"
            element={
              <RequireAuth>
                <PodcastPage />
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
