import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getProgressFor, getQuestion, getQuestions, patchProgress } from '../api.js';
import { MAX_PRACTICED } from '../config/limits.js';
import { subjectHue } from '../config/subjects.js';
import StatusBadge from '../components/StatusBadge.jsx';
import QuestionActions from '../components/QuestionActions.jsx';

const ZERO = { practicedCount: 0, readPassively: false };
const COLLAPSE_DEFAULT_KEY = 'studying.answerSectionsCollapsedDefault';

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

function stripTrim(text) {
  return text
    .split('\n')
    .filter((l) => !/^\s*-{3,}\s*$/.test(l))
    .join('\n')
    .replace(/^\s*\n+/, '')
    .replace(/\n+\s*$/, '');
}

function splitIntoSections(body) {
  if (!body) return { intro: '', sections: [] };
  const introLines = [];
  const sections = [];
  let current = null;
  for (const line of body.split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      if (current) sections.push({ title: current.title, content: stripTrim(current.lines.join('\n')) });
      current = { title: m[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      introLines.push(line);
    }
  }
  if (current) sections.push({ title: current.title, content: stripTrim(current.lines.join('\n')) });
  return { intro: stripTrim(introLines.join('\n')), sections };
}

function readCollapseDefault() {
  try {
    return localStorage.getItem(COLLAPSE_DEFAULT_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeCollapseDefault(val) {
  try {
    localStorage.setItem(COLLAPSE_DEFAULT_KEY, val ? 'true' : 'false');
  } catch {}
}

function AnswerMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        a: ({ href, children: kids, ...rest }) =>
          href && href.startsWith('/pdfs/') ? (
            <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
              {kids}
            </a>
          ) : (
            <a href={href} {...rest}>
              {kids}
            </a>
          ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

export default function QuestionDetailPage() {
  const { slug } = useParams();
  const [question, setQuestion] = useState(null);
  const [progress, setProgress] = useState(ZERO);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collapseAll, setCollapseAll] = useState(() => readCollapseDefault());
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    setOverrides({});
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    // The URL carries the slug; progress is keyed by the question's real id,
    // so fetch the question first and then its progress.
    getQuestion(slug)
      .then((q) => {
        if (cancelled) return null;
        setQuestion(q);
        return getProgressFor(q.id);
      })
      .then((p) => {
        if (!cancelled && p) setProgress(p);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    getQuestions().then(setQuestions).catch(() => {});
  }, []);

  const { prevSlug, nextSlug } = useMemo(() => {
    if (questions.length === 0) return { prevSlug: null, nextSlug: null };
    const idx = questions.findIndex((q) => q.slug === slug || q.id === slug);
    if (idx < 0) return { prevSlug: null, nextSlug: null };
    const n = questions.length;
    return {
      prevSlug: questions[(idx - 1 + n) % n].slug,
      nextSlug: questions[(idx + 1) % n].slug,
    };
  }, [questions, slug]);

  useEffect(() => {
    if (question) document.title = `${question.subjectCode} ${question.subjectIndex}`;
  }, [question]);

  async function mark(action) {
    const prev = progress;
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
    setProgress(optimistic);
    setBusy(true);
    try {
      const { progress: next } = await patchProgress(question.id, action);
      setProgress(next);
    } catch (e) {
      setProgress(prev);
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!question) return <p className="muted">Loading…</p>;

  const { body, sources } = extractSources(question.answer);
  const { intro, sections } = splitIntoSections(body);

  const isExpanded = (i) => (overrides[i] !== undefined ? overrides[i] : !collapseAll);
  const toggleSection = (i) => {
    setOverrides((prev) => ({ ...prev, [i]: !isExpanded(i) }));
  };
  const setAllCollapsed = (val) => {
    setCollapseAll(val);
    writeCollapseDefault(val);
    setOverrides({});
  };

  return (
    <article className="detail">
      <div className="detail-meta-row">
        <Link
          to="/questions"
          className="rotate-btn"
          aria-label="Back to questions"
          title="Back to questions"
        >
          «
        </Link>
        <div className="detail-meta">
          <span
            className="subject-pill"
            style={{ '--subject-hue': subjectHue(question.subjectCode) }}
            title={question.subject}
          >
            {question.subjectCode} {question.subjectIndex}
          </span>
          <StatusBadge progress={progress} />
        </div>
        <div className="detail-nav">
          {prevSlug ? (
            <Link
              to={`/questions/${prevSlug}`}
              className="rotate-btn"
              aria-label="Previous question"
              title="Previous question"
            >
              ‹
            </Link>
          ) : (
            <span className="rotate-btn rotate-spacer" aria-hidden />
          )}
          {nextSlug ? (
            <Link
              to={`/questions/${nextSlug}`}
              className="rotate-btn"
              aria-label="Next question"
              title="Next question"
            >
              ›
            </Link>
          ) : (
            <span className="rotate-btn rotate-spacer" aria-hidden />
          )}
        </div>
      </div>

      <h1 className="detail-question">
        <span className="detail-label">QUESTION</span>
        {question.text}
      </h1>

      <div className="detail-actions">
        <div className="detail-actions-left">
          <button
            className="answer-toggle"
            onClick={() => setShowAnswer((v) => !v)}
          >
            <span className={`answer-toggle-face${showAnswer ? '' : ' is-on'}`}>
              Show answer
            </span>
            <span className={`answer-toggle-face${showAnswer ? ' is-on' : ''}`}>
              Hide answer
            </span>
          </button>
          {showAnswer && sections.length > 0 && (
            <button className="ghost" onClick={() => setAllCollapsed(!collapseAll)}>
              {collapseAll ? 'Expand all' : 'Collapse all'}
            </button>
          )}
        </div>
        <div className="detail-actions-right">
          <QuestionActions progress={progress} onAction={mark} disabled={busy} />
        </div>
      </div>

      {showAnswer && (
        <section className="answer">
          {question.answer ? (
            <>
              {intro && <AnswerMarkdown>{intro}</AnswerMarkdown>}
              {sections.map((s, i) => {
                const expanded = isExpanded(i);
                return (
                  <div className={`answer-section${expanded ? '' : ' collapsed'}`} key={i}>
                    <button
                      type="button"
                      className="answer-section-toggle"
                      aria-expanded={expanded}
                      onClick={() => toggleSection(i)}
                    >
                      <span className="answer-section-caret" aria-hidden>▾</span>
                      <span className="answer-section-title">{s.title}</span>
                    </button>
                    {expanded && (
                      <div className="answer-section-body">
                        <AnswerMarkdown>{s.content}</AnswerMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}
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
