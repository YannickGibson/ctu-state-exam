import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getQuestions, getQuiz } from '../api.js';
import Spinner from '../components/Spinner.jsx';

function groupByQuestionId(questions) {
  const groups = new Map();
  for (const q of questions) {
    const key = q.questionId || '_ungrouped';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(q);
  }
  return groups;
}

function countParts(group) {
  return group.reduce((n, q) => n + (Array.isArray(q.parts) ? q.parts.length : 1), 0);
}

export default function QuizSelectionPage() {
  const { subject } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getQuiz(subject), getQuestions()])
      .then(([q, qs]) => {
        setQuiz(q);
        setQuestions(qs);
      })
      .catch((e) => setError(e.message));
  }, [subject]);

  useEffect(() => {
    if (quiz) document.title = `${quiz.title || subject} · Quizzes`;
  }, [quiz, subject]);

  const groups = useMemo(() => {
    if (!quiz) return [];
    const grouped = groupByQuestionId(quiz.questions || []);
    const byId = new Map(questions.map((q) => [q.id, q]));
    return Array.from(grouped.entries())
      .map(([questionId, items]) => ({
        questionId,
        items,
        question: byId.get(questionId) || null,
        partCount: countParts(items),
      }))
      .sort((a, b) => {
        const ai = a.question?.subjectIndex ?? 0;
        const bi = b.question?.subjectIndex ?? 0;
        return ai - bi;
      });
  }, [quiz, questions]);

  const totalParts = useMemo(
    () => groups.reduce((n, g) => n + g.partCount, 0),
    [groups]
  );

  if (error) return <p className="error">Error: {error}</p>;
  if (!quiz) return <Spinner />;

  const hasAny = (quiz.questions || []).length > 0;

  return (
    <div className="quiz-select">
      <p>
        <Link to="/quizzes">← All quizzes</Link>
      </p>
      <h1>{quiz.title || subject}</h1>
      <p className="muted">{subject}</p>

      {!hasAny && (
        <div className="quiz-empty">
          <p>No quiz questions for this subject yet.</p>
        </div>
      )}

      {hasAny && (
        <>
          <ul className="quiz-select-list">
            {groups.map(({ questionId, question, partCount }) => (
              <li key={questionId}>
                <Link
                  to={`/quizzes/${subject}/${encodeURIComponent(questionId)}`}
                  className="quiz-select-item"
                >
                  <span className="quiz-select-item-id">
                    {question
                      ? `${question.subjectCode}-${question.subjectIndex}`
                      : questionId}
                  </span>
                  <span className="quiz-select-item-text">
                    {question?.text || questionId}
                  </span>
                  <span className="quiz-select-item-count muted">
                    {partCount} part{partCount === 1 ? '' : 's'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={`/quizzes/${subject}/all`}
            className="quiz-select-all"
          >
            <span className="quiz-select-all-title">Practice all</span>
            <span className="muted">
              {groups.length} question{groups.length === 1 ? '' : 's'} · {totalParts} part
              {totalParts === 1 ? '' : 's'}
            </span>
          </Link>
        </>
      )}
    </div>
  );
}
