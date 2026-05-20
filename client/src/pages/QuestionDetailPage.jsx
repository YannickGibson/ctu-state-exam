import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getProgressFor, getQuestion, patchProgress } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const ZERO = { practicedCount: 0, readPassively: false };

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(ZERO);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getQuestion(id), getProgressFor(id)])
      .then(([q, p]) => {
        setQuestion(q);
        setProgress(p);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (question) document.title = `${question.subjectCode} ${question.subjectIndex}`;
  }, [question]);

  async function mark(action) {
    setBusy(true);
    try {
      const { progress: next } = await patchProgress(id, action);
      setProgress(next);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!question) return <p className="muted">Loading…</p>;

  const practiced = progress.practicedCount > 0;

  return (
    <article className="detail">
      <div className="detail-meta">
        <span className="pill">{question.group}</span>
        <span className="pill">{question.id}</span>
        <span className="pill">{question.subject}</span>
        <StatusBadge progress={progress} />
      </div>

      <h1 className="detail-question">
        <span className="detail-label">QUESTION</span>
        {question.text}
      </h1>

      <div className="detail-actions">
        <button onClick={() => setShowAnswer((v) => !v)}>
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
        <button onClick={() => mark('practice')} disabled={busy}>
          Mark practiced
        </button>
        <button
          onClick={() => mark('readPassively')}
          disabled={busy || practiced}
          title={practiced ? 'Already practiced - read-passively no longer applies' : ''}
        >
          Mark read passively
        </button>
        <button className="ghost" onClick={() => mark('reset')} disabled={busy}>
          Reset
        </button>
      </div>

      {showAnswer && (
        <section className="answer">
          {question.answer ? (
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                a: ({ href, children, ...rest }) =>
                  href && href.startsWith('/pdfs/') ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                      {children}
                    </a>
                  ) : (
                    <a href={href} {...rest}>
                      {children}
                    </a>
                  ),
              }}
            >
              {question.answer}
            </ReactMarkdown>
          ) : (
            <p className="muted">
              Answer not written yet. Create <code>data/answers/{question.id}.md</code>.
            </p>
          )}
        </section>
      )}
    </article>
  );
}
