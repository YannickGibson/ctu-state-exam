import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProgress, getQuestions } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressDonut from '../components/ProgressDonut.jsx';

const ZERO = { practicedCount: 0, readPassively: false };
const LAST_VIEWED_KEY = 'questions:lastViewedId';

export default function QuestionsPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [progress, setProgress] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Questions · State Exams';
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

  function rotate(direction) {
    if (questions.length === 0) return;
    const lastId =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(LAST_VIEWED_KEY)
        : null;
    const idx = lastId ? questions.findIndex((q) => q.id === lastId) : -1;
    let nextIdx;
    if (idx < 0) {
      nextIdx = direction > 0 ? 0 : questions.length - 1;
    } else {
      nextIdx = (idx + direction + questions.length) % questions.length;
    }
    const target = questions[nextIdx];
    sessionStorage.setItem(LAST_VIEWED_KEY, target.id);
    navigate(`/questions/${target.id}`);
  }

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
            <th className="col-num">Subject</th>
            <th className="col-subject">#</th>
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
                {q.subject} {q.subjectIndex}
              </td>
              <td className="col-subject">
                {q.group} {q.number}
              </td>
              <td className="q-text">{q.text}</td>
              <td className="col-open">
                <Link className="open-btn" to={`/questions/${q.id}`}>
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        className="rotate-btn rotate-prev"
        onClick={() => rotate(-1)}
        aria-label="Previous question"
        title="Previous question"
      >
        ‹
      </button>
      <button
        type="button"
        className="rotate-btn rotate-next"
        onClick={() => rotate(1)}
        aria-label="Next question"
        title="Next question"
      >
        ›
      </button>
    </div>
  );
}
