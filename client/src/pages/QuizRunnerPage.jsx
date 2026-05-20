import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { completeQuiz, getQuiz } from '../api.js';

function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

export default function QuizRunnerPage() {
  const { subject } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({}); // questionIndex -> choiceIndex
  const [submitted, setSubmitted] = useState(false);
  const [completeError, setCompleteError] = useState(null);

  useEffect(() => {
    getQuiz(subject)
      .then(setQuiz)
      .catch((e) => setError(e.message));
  }, [subject]);

  useEffect(() => {
    if (quiz) document.title = `${quiz.title || subject} · Quiz`;
  }, [quiz, subject]);

  if (error) return <p className="error">Error: {error}</p>;
  if (!quiz) return <p className="muted">Loading…</p>;

  const questions = quiz.questions || [];
  const allAnswered = questions.every((_, i) => answers[i] !== undefined);
  const score = questions.reduce(
    (n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0),
    0
  );

  async function submit() {
    setSubmitted(true);
    try {
      // Finishing the quiz marks the subject's questions as practiced.
      await completeQuiz(subject);
    } catch (e) {
      setCompleteError(e.message);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setCompleteError(null);
  }

  return (
    <div className="quiz-runner">
      <p>
        <Link to="/quizzes">← All quizzes</Link>
      </p>
      <h1>{quiz.title || subject}</h1>
      <p className="muted">{subject}</p>

      {questions.length === 0 && <p className="muted">This quiz has no questions yet.</p>}

      <ol className="quiz-questions">
        {questions.map((q, qi) => (
          <li key={qi} className="quiz-question">
            <div className="quiz-prompt">
              <Markdown>{q.prompt}</Markdown>
            </div>
            <div className="quiz-choices">
              {q.choices.map((choice, ci) => {
                const chosen = answers[qi] === ci;
                let cls = 'choice';
                if (submitted) {
                  if (ci === q.correctIndex) cls += ' correct';
                  else if (chosen) cls += ' wrong';
                } else if (chosen) {
                  cls += ' chosen';
                }
                return (
                  <label key={ci} className={cls}>
                    <input
                      type="radio"
                      name={`q${qi}`}
                      checked={chosen}
                      disabled={submitted}
                      onChange={() => setAnswers((a) => ({ ...a, [qi]: ci }))}
                    />
                    <Markdown>{String(choice)}</Markdown>
                  </label>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="quiz-explanation">
                <strong>Why:</strong> {q.explanation}
              </p>
            )}
          </li>
        ))}
      </ol>

      {!submitted && questions.length > 0 && (
        <button onClick={submit} disabled={!allAnswered}>
          {allAnswered ? 'Submit quiz' : 'Answer all questions to submit'}
        </button>
      )}

      {submitted && (
        <div className="quiz-result">
          <p className="quiz-score">
            Score: {score} / {questions.length}
          </p>
          {completeError ? (
            <p className="error">Could not record practice: {completeError}</p>
          ) : (
            <p className="muted">
              All <strong>{subject}</strong> questions marked as practiced (+1).
            </p>
          )}
          <button className="ghost" onClick={reset}>
            Retake
          </button>
        </div>
      )}
    </div>
  );
}
