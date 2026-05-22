import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgress, getQuestions, patchProgress } from '../api.js';
import { MAX_PRACTICED } from '../config/limits.js';
import { subjectHue } from '../config/subjects.js';
import StatusBadge from '../components/StatusBadge.jsx';
import ProgressDonut from '../components/ProgressDonut.jsx';
import QuestionActions from '../components/QuestionActions.jsx';

const ZERO = { practicedCount: 0, readPassively: false };

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
    const q = search.trim().toLowerCase().replace(/\s+/g, ' ');
    const subjectLock = q
      ? merged.find(
          (item) =>
            q === item.subject.toLowerCase() ||
            q === item.subjectCode.toLowerCase()
        )?.subject ?? null
      : null;
    const groupLock =
      q && !subjectLock
        ? merged.find((item) => q === item.group.toLowerCase())?.group ?? null
        : null;
    return merged.filter((item) => {
      if (group !== 'ALL' && item.group !== group) return false;
      if (!q) return true;
      if (subjectLock) return item.subject === subjectLock;
      if (groupLock) return item.group === groupLock;
      const haystack = [
        item.text,
        item.subject,
        item.subjectCode,
        item.id,
        `${item.subject} ${item.subjectIndex}`,
        `${item.subjectCode} ${item.subjectIndex}`,
        `${item.group} ${item.number}`,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [merged, group, search]);

  async function handleAction(id, action) {
    const prev = progress[id] || ZERO;
    let optimistic;
    if (action === 'practice') {
      optimistic = {
        readPassively: false,
        practicedCount: Math.min(prev.practicedCount + 1, MAX_PRACTICED),
      };
    } else if (action === 'readPassively') {
      optimistic = {
        readPassively: prev.practicedCount === 0,
        practicedCount: prev.practicedCount,
      };
    } else if (action === 'reset') {
      optimistic = ZERO;
    } else {
      return;
    }
    setProgress((p) => ({ ...p, [id]: optimistic }));
    try {
      const { progress: next } = await patchProgress(id, action);
      setProgress((p) => ({ ...p, [id]: next }));
    } catch (e) {
      setProgress((p) => ({ ...p, [id]: prev }));
      setError(e.message);
    }
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
            <th className="col-actions"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((q) => (
            <tr
              key={q.id}
              className="q-row"
              onClick={() => navigate(`/questions/${q.id}`)}
            >
              <td className="col-status">
                <StatusBadge progress={q.progress} />
              </td>
              <td className="col-num">
                <span
                  className="subject-pill"
                  style={{ '--subject-hue': subjectHue(q.subjectCode) }}
                  title={q.subject}
                >
                  {q.subjectCode} {q.subjectIndex}
                </span>
              </td>
              <td className="col-subject">
                {q.group} {q.number}
              </td>
              <td className="q-text">{q.text}</td>
              <td className="col-actions">
                <QuestionActions
                  progress={q.progress}
                  onAction={(action) => handleAction(q.id, action)}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
