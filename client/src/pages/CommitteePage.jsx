import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCommittee } from '../api.js';
import { subjectHue } from '../config/subjects.js';
import { ZERO } from '../progressCache.js';
import { useProgress } from '../ProgressContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import QuestionActions from '../components/QuestionActions.jsx';
import InlineMarkdown from '../components/InlineMarkdown.jsx';
import Spinner from '../components/Spinner.jsx';

// A subject pill in the app palette (config/subjects.js hue → styles.css).
// `code` null renders a neutral pill (non-bank courses like BI-PST).
function Pill({ code, children, title }) {
  if (!code) return <span className="pill-neutral" title={title}>{children}</span>;
  return (
    <span className="subject-pill" style={{ '--subject-hue': subjectHue(code) }} title={title}>
      {children}
    </span>
  );
}

function TeachPill({ t }) {
  // Appended asked-only subjects carry a bare code (e.g. "ADM"); the declared
  // courses already read "NI-VSM" etc. Prefix the bare ones so all badges match.
  const label = t.subjectCode && t.label === t.subjectCode ? `NI-${t.label}` : t.label;
  // Wrap in ONE inline child: the pill is display:inline-flex, which collapses
  // whitespace-only nodes between flex items. Keeping label+count inside a
  // single span puts the space in normal inline flow so it renders (and copies).
  return (
    <Pill code={t.subjectCode} title={t.subjectCode || t.label}>
      <span className="tp">
        {label}
        {t.count != null && <b className="ax"> (asked {t.count}x)</b>}
      </span>
    </Pill>
  );
}

function MemberCard({ m }) {
  // Derive the chip class from the role itself so chair / vice-chair / member
  // are visually distinct (the data's rolecls collapses vice+member).
  const roleClass =
    m.role === 'předseda' ? 'chair' : m.role === 'místopředseda' ? 'vice' : 'member';
  return (
    <div className="cm-card">
      <div className="cm-head">
        <img className="cm-photo" src={m.photo} alt={m.name} loading="lazy" />
        <div>
          <div className="cm-name">{m.name}</div>
          <div className="cm-dept">{m.dept}</div>
          <span className={`cm-role ${roleClass}`}>{m.role}</span>
        </div>
      </div>

      <div className="cm-row">
        <div className="cm-label">Familiar with</div>
        <div className="cm-pills">
          {/* relevant subjects (most-asked first), then no-question courses last */}
          {[...m.teaches]
            .sort((a, b) => (b.count ?? -1) - (a.count ?? -1))
            .map((t, i) => <TeachPill key={i} t={t} />)}
        </div>
      </div>

      {m.asks.length > 0 && (
        <details className="cm-asks">
          <summary>▸ show questions &amp; student quotes</summary>
          <div className="cm-asks-body">
            {m.asks.map((g) => (
              <div key={g.subjectCode}>
                <div className="cm-asubj">
                  <Pill code={g.subjectCode}>{g.subjectCode}</Pill>
                  <span className="muted">{g.total}× total</span>
                </div>
                {g.questions.map((q) => (
                  <div key={q.id} className="cm-aq">
                    <div className="cm-aq-head">
                      <Pill code={q.ref.split(' ')[0]}>{q.ref}</Pill>
                      <span className="cm-aq-n">asked {q.askedCount}×</span>
                      <span className="cm-aq-text"><InlineMarkdown>{q.text}</InlineMarkdown></span>
                    </div>
                    {q.dates && <div className="cm-aq-dates">📅 {q.dates}</div>}
                    {q.quotes.map((qt, j) => (
                      <blockquote key={j} className="cm-quote">
                        <span className="cm-quote-term">{qt.term}</span> {qt.text}
                      </blockquote>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function ExaminerChips({ examiners, unattributed }) {
  if (!examiners.length && !unattributed) {
    return <span className="muted" style={{ fontSize: '11.5px' }}>no asking recorded</span>;
  }
  return (
    <>
      {examiners.map((e, i) => (
        <span key={i} className={e.ours ? 'exc' : 'exc-other'}>
          {e.ours ? '★ ' : ''}{e.name} ×{e.count}
        </span>
      ))}
      {unattributed > 0 && (
        <span className="exc-other" style={{ opacity: 0.7 }}>+{unattributed} unnamed</span>
      )}
    </>
  );
}

function RankedTable({ questions, progressFor, onAction }) {
  const [open, setOpen] = useState(() => new Set());
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  return (
    <div className="cq-table-wrap">
      <table className="cq2">
        <thead>
          <tr>
            <th className="cq2-rank">#</th>
            <th>Subj</th>
            <th>Question</th>
            <th className="right" title="AI-estimated likelihood this committee asks the question — a heuristic weighting of the FIT-Wiki logs, not an exact formula">AI-est. %</th>
            <th className="right" title="times asked by THIS committee (FIT-Wiki 2012–2026)">By committee</th>
            <th className="right" title="times asked by anyone on record (FIT-Wiki 2012–2026)">Total asked</th>
            <th>Status</th>
            <th aria-label="actions" />
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => {
            const progress = progressFor(q.id) || ZERO;
            const isOpen = open.has(q.id);
            return (
              <Fragment key={q.id}>
                <tr className="cq2-row" onClick={() => toggle(q.id)}>
                  <td className="cq2-rank">{q.rank}</td>
                  <td><Pill code={q.subjectCode} title={q.id}>{q.ref}</Pill></td>
                  <td className="cq2-q">
                    <span className="cq2-caret">{isOpen ? '▾' : '▸'}</span>
                    <InlineMarkdown>{q.text}</InlineMarkdown>
                  </td>
                  <td className="right"><span className="cq-prob">{q.probability}%</span></td>
                  <td className="right cq2-num">{q.committeeCount}</td>
                  <td className="right cq2-num">{q.totalCount}</td>
                  <td onClick={(e) => e.stopPropagation()}><StatusBadge progress={progress} /></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <QuestionActions progress={progress} onAction={(a) => onAction(q.id, a)} compact />
                  </td>
                </tr>
                {isOpen && (
                  <tr className="cq2-detail">
                    <td colSpan={8}>
                      <div className="cq2-detbody">
                        <div className="prow">
                          <div className="plabel">Every teacher who has asked it <span className="muted">(this committee ★ green)</span></div>
                          <ExaminerChips examiners={q.examiners} unattributed={q.unattributed} />
                        </div>
                        <div className="prow">
                          <div className="plabel">By year (FIT-Wiki logs 2012–2026)</div>
                          {q.byYear.length
                            ? q.byYear.map((y, i) => <span key={i} className="yc">{y.p.replace(' ', '')}·{y.n}</span>)
                            : <span className="muted" style={{ fontSize: '11.5px' }}>none recorded</span>}
                          <b style={{ marginLeft: '6px' }}>Σ {q.totalCount}×</b>
                        </div>
                        <Link className="cq2-open" to={`/questions/${q.slug}`}>Open question &amp; answer →</Link>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function CommitteePage() {
  const { progressFor, markProgress, loading: progressLoading } = useProgress();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = 'Committee';
    getCommittee().then(setData).catch((e) => setError(e.message));
  }, []);

  async function handleAction(id, action) {
    try {
      await markProgress(id, action);
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!data || progressLoading) return <Spinner />;

  // Possible examiners per subject = every committee member with a recorded
  // asking in it (most-asked first), derived from the member cards' own data.
  const examinersBySubject = {};
  for (const m of data.members) {
    for (const a of m.asks) {
      (examinersBySubject[a.subjectCode] ||= []).push({ name: m.key, count: a.total });
    }
  }
  Object.values(examinersBySubject).forEach((arr) => arr.sort((a, b) => b.count - a.count));
  const possibleExaminers = (p) => {
    const list = p.subjectCode ? examinersBySubject[p.subjectCode] : null;
    return list && list.length ? list.map((x) => x.name).join(', ') : 'none present';
  };

  return (
    <div className="committee">
      <h1>{data.title}</h1>

      <h2>The committee</h2>
      <div className="cm-grid">
        {data.members.map((m) => <MemberCard key={m.key} m={m} />)}
      </div>

      <h2>All 42 questions, ranked by likelihood this committee asks it</h2>
      <p className="cq-note">
        The % is an <b>AI-estimated</b> likelihood (a committee-weighted heuristic over the FIT-Wiki
        logs, not an exact formula). Click a row to see every teacher who's asked it and when.
      </p>
      <RankedTable questions={data.ranked} progressFor={progressFor} onAction={handleAction} />

      <h2>What to study, in priority order</h2>
      <div className="cq-table-wrap">
        <table className="cq-priority">
          <thead>
            <tr><th>Priority</th><th>Subject</th><th>Possible examiners</th><th className="right">Slot share</th></tr>
          </thead>
          <tbody>
            {data.priority.map((p, i) => (
              <tr key={i}>
                <td className={p.tier}>{p.rank}</td>
                <td>{p.subjectCode ? <Pill code={p.subjectCode}>{p.subjectCode}</Pill>
                  : <span className="pill-neutral">{p.subjects}</span>}</td>
                <td>{possibleExaminers(p)}</td>
                <td className="right">{p.slotShare}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
