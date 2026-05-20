import { useEffect, useMemo, useState } from 'react';
import { getLeaderboard, getQuestions } from '../api.js';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Leaderboard · SZZ Study';
    Promise.all([getLeaderboard(), getQuestions()])
      .then(([lb, qs]) => {
        setEntries(lb);
        setQuestions(qs);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const qById = useMemo(() => {
    const m = new Map();
    for (const q of questions) m.set(q.id, q);
    return m;
  }, [questions]);

  const decorated = useMemo(
    () =>
      entries.map((e) => {
        const bySubject = new Map();
        for (const r of e.rows) {
          const q = qById.get(r.question_id);
          const key = q?.subjectCode || q?.subject || '?';
          bySubject.set(key, (bySubject.get(key) || 0) + r.practiced_count);
        }
        const subjectChips = [...bySubject.entries()].sort((a, b) => b[1] - a[1]);
        const practicedQuestions = e.rows
          .map((r) => ({ ...r, question: qById.get(r.question_id) }))
          .sort(
            (a, b) =>
              b.practiced_count - a.practiced_count ||
              (a.question?.subject || '').localeCompare(b.question?.subject || '')
          );
        return { ...e, subjectChips, practicedQuestions };
      }),
    [entries, qById]
  );

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
                    <strong>{e.score}</strong> events ·{' '}
                    <span className="muted">{e.questionsCount} questions</span>
                  </span>
                  <span className="lb-subjects">
                    {e.subjectChips.map(([code, n]) => (
                      <span key={code} className="lb-chip">
                        {code} <em>{n}</em>
                      </span>
                    ))}
                  </span>
                  <span className="lb-caret" aria-hidden>
                    {open ? '▾' : '▸'}
                  </span>
                </button>
                {open && (
                  <div className="lb-detail">
                    <table className="lb-detail-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Subject</th>
                          <th>Question</th>
                          <th className="lb-count-col">Practiced</th>
                        </tr>
                      </thead>
                      <tbody>
                        {e.practicedQuestions.map((r) => (
                          <tr key={r.question_id}>
                            <td className="lb-q-num">
                              {r.question?.group} {r.question?.number}
                            </td>
                            <td className="lb-q-subject">{r.question?.subject || '—'}</td>
                            <td className="lb-q-text">
                              {r.question?.text || r.question_id}
                            </td>
                            <td className="lb-q-count">×{r.practiced_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
