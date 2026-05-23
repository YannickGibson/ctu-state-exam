import { useEffect, useMemo, useState } from 'react';
import { getQuestions } from '../api.js';
import { ZERO } from '../progressCache.js';
import { useProgress } from '../ProgressContext.jsx';
import ProgressDonut from '../components/ProgressDonut.jsx';
import QuestionsTable from '../components/QuestionsTable.jsx';
import Spinner from '../components/Spinner.jsx';

export default function QuestionsPage() {
  const { progress, loading: progressLoading, markProgress } = useProgress();
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [group, setGroup] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Questions';
    getQuestions()
      .then(setQuestions)
      .catch((e) => setError(e.message))
      .finally(() => setQuestionsLoading(false));
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
    try {
      await markProgress(id, action);
    } catch (e) {
      setError(e.message);
    }
  }

  if (questionsLoading || progressLoading) return <Spinner />;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <h1>Questions</h1>
      <ProgressDonut questions={filtered} onAction={handleAction} />
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

      <QuestionsTable questions={filtered} onAction={handleAction} />
    </div>
  );
}
