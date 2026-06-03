import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { getQuestion, getQuestions } from '../api.js';
import { toPdfjsHref } from '../pdfLinks.js';
import { useProgress } from '../ProgressContext.jsx';
import { subjectHue } from '../config/subjects.js';
import StatusBadge from '../components/StatusBadge.jsx';
import QuestionActions from '../components/QuestionActions.jsx';
import AnswerAudio from '../components/AnswerAudio.jsx';
import InlineMarkdown from '../components/InlineMarkdown.jsx';
import { Volume2, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from '../components/Spinner.jsx';

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
  let droppedTitle = false;
  for (const line of body.split('\n')) {
    if (!droppedTitle && current === null && /^#\s+/.test(line)) {
      // The page header already shows the question title; skip the leading H1.
      droppedTitle = true;
      continue;
    }
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
            <a href={toPdfjsHref(href)} target="_blank" rel="noopener noreferrer" {...rest}>
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
  const { progressFor, markProgress, loading: progressLoading } = useProgress();
  const [question, setQuestion] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collapseAll, setCollapseAll] = useState(() => readCollapseDefault());
  const [overrides, setOverrides] = useState({});
  const [audioOpen, setAudioOpen] = useState(false);

  useEffect(() => {
    setOverrides({});
    setAudioOpen(false);
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    // Question content is memoized in api.js, so revisiting one is instant;
    // progress is read from the shared cache, not a per-question fetch.
    getQuestion(slug)
      .then((q) => {
        if (!cancelled) setQuestion(q);
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

  // Warm the content cache for the neighbours so skipping forward/back is
  // instant even on the first pass through the questions.
  useEffect(() => {
    if (prevSlug) getQuestion(prevSlug).catch(() => {});
    if (nextSlug) getQuestion(nextSlug).catch(() => {});
  }, [prevSlug, nextSlug]);

  useEffect(() => {
    if (question) document.title = `${question.subjectCode} ${question.subjectIndex}`;
  }, [question]);

  async function mark(action) {
    setBusy(true);
    try {
      await markProgress(question.id, action);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!question || progressLoading) return <Spinner />;

  const progress = progressFor(question.id);
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
              <ChevronLeft size={20} aria-hidden />
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
              <ChevronRight size={20} aria-hidden />
            </Link>
          ) : (
            <span className="rotate-btn rotate-spacer" aria-hidden />
          )}
        </div>
      </div>

      <h1 className="detail-question">
        <span className="detail-label">QUESTION</span>
        <InlineMarkdown>{question.text}</InlineMarkdown>
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
          {question.audio && (
            <button
              type="button"
              className={`answer-audio-toggle${audioOpen ? ' is-on' : ''}`}
              onClick={() => setAudioOpen((v) => !v)}
              aria-pressed={audioOpen}
              aria-label={audioOpen ? 'Stop narration' : 'Listen to the narrated answer'}
              title={audioOpen ? 'Stop narration' : 'Listen to the narrated answer'}
            >
              <Volume2 size={18} aria-hidden />
            </button>
          )}
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

      {question.audio && audioOpen && (
        <AnswerAudio questionId={question.id} timing={question.audio} />
      )}

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
                      <span className="answer-section-title">
                        <InlineMarkdown>{s.title}</InlineMarkdown>
                      </span>
                    </button>
                    {expanded && (
                      <div className="answer-section-body">
                        <AnswerMarkdown>{s.content}</AnswerMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            <p className="muted">
              Answer not written yet. Create <code>data/answers/{question.id}.md</code>.
            </p>
          )}
        </section>
      )}

      {sources.length > 0 && (
        <footer className="detail-sources">
          {sources.map((url) => (
            <a key={url} href={toPdfjsHref(url)} target="_blank" rel="noopener noreferrer">
              Otevřít zdrojový soubor
            </a>
          ))}
        </footer>
      )}
    </article>
  );
}
