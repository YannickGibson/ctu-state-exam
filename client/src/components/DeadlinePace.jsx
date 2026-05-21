import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import {
  daysUntilExam,
  formatExamDate,
  toExamDateInputValue,
} from '../config/exam.js';

export default function DeadlinePace({ remaining }) {
  const { profile, setExamDate } = useAuth();
  const target = profile?.exam_date || undefined;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => toExamDateInputValue(target));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function startEdit() {
    setDraft(toExamDateInputValue(profile?.exam_date || undefined));
    setError(null);
    setEditing(true);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    try {
      await setExamDate(draft);
      setEditing(false);
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    setError(null);
    try {
      await setExamDate(null);
      setEditing(false);
    } catch (e) {
      setError(e.message || 'Failed to reset');
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <span className="deadline-edit">
        <input
          type="date"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
        />
        <button type="button" className="deadline-btn primary" onClick={save} disabled={saving || !draft}>
          Save
        </button>
        {profile?.exam_date && (
          <button type="button" className="deadline-btn" onClick={reset} disabled={saving}>
            Reset
          </button>
        )}
        <button type="button" className="deadline-btn" onClick={() => setEditing(false)} disabled={saving}>
          Cancel
        </button>
        {error && <span className="deadline-err">{error}</span>}
      </span>
    );
  }

  const date = formatExamDate(target);
  const days = daysUntilExam(target);
  const adjust = profile && (
    <button type="button" className="deadline-adjust" onClick={startEdit} title="Set your own exam date">
      (adjust)
    </button>
  );

  let body;
  if (days < 0) body = `Exam date (${date}) has passed.`;
  else if (days === 0)
    body = remaining > 0 ? `Exam today (${date}) · ${remaining} left` : `Exam today (${date})`;
  else if (remaining === 0) body = `${days} days left until ${date} · all practiced`;
  else {
    const perDay = (Math.ceil((remaining / days) * 100) / 100).toFixed(2);
    body = `${days} days left until ${date} · ${perDay} / day`;
  }

  return (
    <span>
      {body} {adjust}
    </span>
  );
}
