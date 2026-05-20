import { useEffect, useMemo, useState } from 'react';
import { getProgress, getQuestions } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressDonut from '../components/ProgressDonut.jsx';

const ZERO = { practicedCount: 0, readPassively: false };

export default function QuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Questions · SZZ Study';
    Promise.all([getQuestions(), getProgress()])
      .then(([qs, pg]) => {
        setQuestions(qs);
        setProgress(pg);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const merged = useMemo(
    () => questions.map((q) => ({ ...q, progress: progress[q.id] || ZERO })),
    [questions, progress]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return merged.filter((item) => {
      if (group !== 'ALL' && item.group !== group) return false;
      if (!q) return true;
      return (
        item.text.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [merged, group, search]);

  if (loading) return <p className="muted">Loading…</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <h1>Questions</h1>
      <ProgressDonut questions={filtered} />
      <div className="toolbar">
        <div className="group-filter">
          {['ALL', 'SPOL', 'ZI'].map((g) => (
            <button
              key={g}
              className={group === g ? 'chip active' : 'chip'}
              onClick={() => setGroup(g)}
            >
              {g === 'ALL' ? 'All' : g}
            </button>
          ))}
        </div>
        <input
          className="search"
          type="search"
          placeholder="Search questions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted count">{filtered.length} shown</span>
      </div>

      <table className="questions">
        <thead>
          <tr>
            <th className="col-status">Status</th>
            <th className="col-num">#</th>
            <th className="col-subject">Subject</th>
            <th>Question</th>
            <th className="col-open"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q) => (
            <tr key={q.id}>
              <td className="col-status">
                <StatusBadge progress={q.progress} />
              </td>
              <td className="col-num">
                {q.group} {q.number}
              </td>
              <td className="col-subject">{q.subject}</td>
              <td className="q-text">{q.text}</td>
              <td className="col-open">
                <a
                  className="open-btn"
                  href={`/questions/${q.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
