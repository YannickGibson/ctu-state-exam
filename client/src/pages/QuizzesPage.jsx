import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes } from '../api.js';
import Spinner from '../components/Spinner.jsx';

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Quizzes';
    getQuizzes()
      .then(setQuizzes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div>
      <h1>Quizzes</h1>
      <p className="muted">
        One quiz per subject. Finishing a quiz marks every exam question of that
        subject as practiced.
      </p>
      <div className="quiz-grid">
        {quizzes.map((q) => (
          <Link key={q.subject} className="quiz-card" to={`/quizzes/${q.subject}`}>
            <span className="quiz-code">{q.subjectCode}</span>
            <span className="quiz-subject">{q.subject}</span>
            <span className="muted">
              {q.group} · {q.questionCount} question{q.questionCount === 1 ? '' : 's'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
