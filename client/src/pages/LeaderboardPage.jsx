import { useEffect, useMemo, useState } from 'react';
import { getLeaderboard, getQuestions } from '../api.js';
import DonutChart from '../components/DonutChart.jsx';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Leaderboard';
    Promise.all([getLeaderboard(), getQuestions()])
      .then(([lb, qs]) => {
        setEntries(lb);
        setQuestions(qs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const decorated = useMemo(() => {
    return entries.map((e) => {
      const byId = new Map(e.rows.map((r) => [r.question_id, r]));
      const userQuestions = questions.map((q) => {
        const r = byId.get(q.id);
        return {
          ...q,
          progress: r
            ? { practicedCount: r.practiced_count, readPassively: false }
            : null,
        };
      });
      return { ...e, userQuestions };
    });
  }, [entries, questions]);

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>
      <p className="muted lb-subtitle">
        Sorted by cumulative practice events across all users.
      </p>

      {decorated.length === 0 ? (
        <p className="muted">No practice activity yet.</p>
      ) : (
        <ol className="lb-list">
          {decorated.map((e, i) => {
            const rank = i + 1;
            const open = expanded === e.userId;
            return (
              <li
                key={e.userId}
                className={`lb-row${open ? ' open' : ''}${rank <= 3 ? ` rank-${rank}` : ''}`}
              >
                <button
                  type="button"
                  className="lb-row-head"
                  onClick={() => setExpanded(open ? null : e.userId)}
                  aria-expanded={open}
                >
                  <span className="lb-rank">#{rank}</span>
                  <span className="lb-name">{e.username}</span>
                  <span className="lb-stats">
                    <span className="lb-stat lb-stat-dim">
                      <em>{e.questionsCount}</em>
                      <small>Unique</small>
                    </span>
                    <span className="lb-stat">
                      <em>{e.score}</em>
                      <small>Total</small>
                    </span>
                  </span>
                  <span className="lb-caret" aria-hidden>
                    {open ? '▾' : '▸'}
                  </span>
                </button>
                {open && (
                  <div className="lb-detail">
                    <DonutChart questions={e.userQuestions} compact />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
