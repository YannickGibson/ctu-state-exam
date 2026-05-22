import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getQuiz } from '../api.js';
import { useProgress } from '../ProgressContext.jsx';
import {
  asParts,
  partIsAnswered,
  partIsCorrect,
  partKey,
  textIsCorrect,
} from '../quizGrading.js';

function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {children}
    </ReactMarkdown>
  );
}

export default function QuizRunnerPage() {
  const { subject, scope } = useParams();
  const { completeQuizCached } = useProgress();
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({}); // key "qi:pi" -> string | number
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

  // Reset state when the scope changes so retake/back doesn't keep stale picks.
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setCompleteError(null);
  }, [scope, subject]);

  if (error) return <p className="error">Error: {error}</p>;
  if (!quiz) return <p className="muted">Loading…</p>;

  const allQuestions = quiz.questions || [];
  const scopeIsAll = !scope || scope === 'all';
  const questions = scopeIsAll
    ? allQuestions
    : allQuestions.filter((q) => q.questionId === scope);
  const flatParts = questions.flatMap((q, qi) =>
    asParts(q).map((part, pi) => ({ qi, pi, part }))
  );
  const allAnswered = flatParts.every(({ qi, pi, part }) =>
    partIsAnswered(part, answers[partKey(qi, pi)])
  );
  const score = flatParts.reduce(
    (n, { qi, pi, part }) =>
      n + (partIsCorrect(part, answers[partKey(qi, pi)]) ? 1 : 0),
    0
  );
  const total = flatParts.length;

  async function submit() {
    setSubmitted(true);
    try {
      // Mark only the SPOL questions covered by the quiz we just ran.
      const ids = Array.from(
        new Set(questions.map((q) => q.questionId).filter(Boolean))
      );
      await completeQuizCached(subject, ids.length > 0 ? ids : undefined);
    } catch (e) {
      setCompleteError(e.message);
    }
  }

  function reset() {
    setAnswers({});
    setSubmitted(false);
    setCompleteError(null);
  }

  function setAnswer(qi, pi, value) {
    setAnswers((a) => ({ ...a, [partKey(qi, pi)]: value }));
  }

  return (
    <div className="quiz-runner">
      <p>
        <Link to={`/quizzes/${subject}`}>← Back to {subject}</Link>
      </p>
      <h1>{quiz.title || subject}</h1>
      <p className="muted">
        {subject}
        {!scopeIsAll && ` · ${scope}`}
      </p>

      {questions.length === 0 && (
        <p className="muted">
          {scopeIsAll
            ? 'This quiz has no questions yet.'
            : `No questions match ${scope}.`}
        </p>
      )}

      <ol className="quiz-questions">
        {questions.map((q, qi) => {
          const parts = asParts(q);
          return (
            <li key={qi} className="quiz-question">
              {q.prompt && (
                <div className="quiz-prompt">
                  <Markdown>{q.prompt}</Markdown>
                </div>
              )}
              <div className="quiz-parts">
                {parts.map((part, pi) => {
                  const value = answers[partKey(qi, pi)];
                  return (
                    <div key={pi} className="quiz-part">
                      {(part.label || part.prompt) && (
                        <div className="quiz-part-prompt">
                          {part.label && <span className="quiz-part-label">{part.label})</span>}
                          {part.prompt && <Markdown>{part.prompt}</Markdown>}
                        </div>
                      )}
                      {part.kind === 'text' ? (
                        <TextPart
                          part={part}
                          value={value}
                          submitted={submitted}
                          onChange={(v) => setAnswer(qi, pi, v)}
                        />
                      ) : (
                        <ChoicePart
                          part={part}
                          name={`q${qi}p${pi}`}
                          value={value}
                          submitted={submitted}
                          onChange={(ci) => setAnswer(qi, pi, ci)}
                        />
                      )}
                      {submitted && part.explanation && (
                        <div className="quiz-explanation">
                          <strong>Why:</strong> <Markdown>{part.explanation}</Markdown>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      {!submitted && questions.length > 0 && (
        <button onClick={submit} disabled={!allAnswered}>
          {allAnswered ? 'Submit quiz' : 'Answer all questions to submit'}
        </button>
      )}

      {submitted && (
        <div className="quiz-result">
          <p className="quiz-score">
            Score: {score} / {total}
          </p>
          {completeError ? (
            <p className="error">Could not record practice: {completeError}</p>
          ) : (
            <p className="muted">
              {scopeIsAll ? (
                <>All <strong>{subject}</strong> questions covered by this quiz marked as practiced (+1).</>
              ) : (
                <><strong>{scope}</strong> marked as practiced (+1).</>
              )}
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

function ChoicePart({ part, name, value, submitted, onChange }) {
  return (
    <div className="quiz-choices">
      {part.choices.map((choice, ci) => {
        const chosen = value === ci;
        let cls = 'choice';
        if (submitted) {
          if (ci === part.correctIndex) cls += ' correct';
          else if (chosen) cls += ' wrong';
        } else if (chosen) {
          cls += ' chosen';
        }
        return (
          <label key={ci} className={cls}>
            <input
              type="radio"
              name={name}
              checked={chosen}
              disabled={submitted}
              onChange={() => onChange(ci)}
            />
            <Markdown>{String(choice)}</Markdown>
          </label>
        );
      })}
    </div>
  );
}

function TextPart({ part, value, submitted, onChange }) {
  const correct = submitted && textIsCorrect(part, value);
  const wrong = submitted && !correct;
  let cls = 'quiz-text-input';
  if (correct) cls += ' correct';
  else if (wrong) cls += ' wrong';
  return (
    <div className="quiz-text">
      <input
        type="text"
        className={cls}
        value={value ?? ''}
        disabled={submitted}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
      {wrong && (
        <span className="quiz-text-answer">
          správně: <code>{part.correctAnswer}</code>
        </span>
      )}
    </div>
  );
}
