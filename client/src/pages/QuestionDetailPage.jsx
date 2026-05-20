import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getProgressFor, getQuestion, getQuestions, patchProgress } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';

const ZERO = { practicedCount: 0, readPassively: false };

// A "source-PDF" link is `[text](/pdfs/X)` with no fragment and no leading `!`
// (i.e. not an image). Inline page references like `/pdfs/X.pdf#page=12` and
// image embeds `![alt](/pdfs/X.svg)` are deliberately excluded.
const SOURCE_LINK_RE = /(?<!!)\[[^\]]+\]\((\/pdfs\/[^\s)#]+)\)/g;

function extractSources(markdown) {
  if (!markdown) return { body: '', sources: [] };
  const sources = [];
  const seen = new Set();
  const kept = [];
  for (const line of markdown.split('\n')) {
    SOURCE_LINK_RE.lastIndex = 0;
    let match;
    let hadSource = false;
    while ((match = SOURCE_LINK_RE.exec(line)) !== null) {
      hadSource = true;
      const url = match[1];
      if (!seen.has(url)) {
        seen.add(url);
        sources.push(url);
      }
    }
    if (!hadSource) kept.push(line);
  }
  const body = kept.join('\n').replace(/^\s*\n+/, '').replace(/\n+\s*$/, '');
  return { body, sources };
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(ZERO);
  const [questions, setQuestions] = useState([]);
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
    getQuestions().then(setQuestions).catch(() => {});
  }, []);

  const { prevId, nextId } = useMemo(() => {
    if (questions.length === 0) return { prevId: null, nextId: null };
    const idx = questions.findIndex((q) => q.id === id);
    if (idx < 0) return { prevId: null, nextId: null };
    const n = questions.length;
    return {
      prevId: questions[(idx - 1 + n) % n].id,
      nextId: questions[(idx + 1) % n].id,
    };
  }, [questions, id]);

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
  const { body, sources } = extractSources(question.answer);

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

      {(prevId || nextId) && (
        <>
          {prevId && (
            <Link
              to={`/questions/${prevId}`}
              className="rotate-btn rotate-prev"
              aria-label="Previous question"
              title="Previous question"
            >
              ‹
            </Link>
          )}
          {nextId && (
            <Link
              to={`/questions/${nextId}`}
              className="rotate-btn rotate-next"
              aria-label="Next question"
              title="Next question"
            >
              ›
            </Link>
          )}
        </>
      )}

      {showAnswer && (
        <section className="answer">
          {question.answer ? (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
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
                {body}
              </ReactMarkdown>
              {sources.length > 0 && (
                <div className="answer-sources">
                  {sources.map((url) => (
                    <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                      Otevřít zdrojový soubor
                    </a>
                  ))}
                </div>
              )}
            </>
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
