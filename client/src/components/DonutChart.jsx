import { useMemo } from 'react';

export const DONUT_COLORS = {
  practiced: '#36974a',
  read: '#d4a82a',
  none: '#cdd2da',
};

function classify(p) {
  if (!p) return 'none';
  if (p.practicedCount >= 1) return 'practiced';
  if (p.readPassively) return 'read';
  return 'none';
}

function pt(cx, cy, r, angle) {
  return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
}

function annularSector(cx, cy, rOuter, rInner, startA, endA) {
  const large = endA - startA > Math.PI ? 1 : 0;
  const [x1, y1] = pt(cx, cy, rOuter, startA);
  const [x2, y2] = pt(cx, cy, rOuter, endA);
  const [x3, y3] = pt(cx, cy, rInner, endA);
  const [x4, y4] = pt(cx, cy, rInner, startA);
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4}`,
    'Z',
  ].join(' ');
}

export function buildDonutData(questions) {
  const bySubject = new Map();
  const order = [];
  for (const q of questions) {
    if (!bySubject.has(q.subject)) {
      order.push(q.subject);
      bySubject.set(q.subject, {
        subject: q.subject,
        subjectCode: q.subjectCode,
        total: 0,
        practiced: 0,
        read: 0,
        none: 0,
        questions: [],
      });
    }
    const s = bySubject.get(q.subject);
    s.total++;
    s[classify(q.progress)]++;
    s.questions.push(q);
  }
  for (const s of bySubject.values()) {
    s.questions.sort((a, b) => (a.subjectIndex ?? 0) - (b.subjectIndex ?? 0));
  }
  const subjects = order.map((k) => bySubject.get(k));
  const sum = (key) => subjects.reduce((n, s) => n + s[key], 0);
  return {
    subjects,
    total: sum('total'),
    practiced: sum('practiced'),
    read: sum('read'),
    none: sum('none'),
  };
}

export default function DonutChart({
  questions,
  onSliceClick,
  showLegend = true,
  hint = null,
  compact = false,
}) {
  const data = useMemo(() => buildDonutData(questions), [questions]);

  if (data.total === 0) {
    return (
      <section className={`progress-donut empty${compact ? ' compact' : ''}`}>
        <p className="muted">No questions to show.</p>
      </section>
    );
  }

  const VB = 320;
  const cx = VB / 2;
  const cy = VB / 2;
  const rOuter = 122;
  const rInner = 78;
  const labelR = rOuter + 16;
  const TWO_PI = 2 * Math.PI;
  const gap = Math.min((2 * Math.PI) / 180, TWO_PI / data.subjects.length / 8);
  const effectiveGap = data.subjects.length > 1 ? gap : 0;

  const segments = [];
  let cursor = 0;
  for (const s of data.subjects) {
    const span = (s.total / data.total) * TWO_PI - effectiveGap;
    const startA = cursor;
    const endA = startA + Math.max(span, 0.0001);
    const arcs = [];
    const perQ = (endA - startA) / s.total;
    let sub = startA;
    let runKind = null;
    let runStart = startA;
    for (const q of s.questions) {
      const kind = classify(q.progress);
      if (runKind === null) {
        runKind = kind;
        runStart = sub;
      } else if (kind !== runKind) {
        arcs.push({ kind: runKind, startA: runStart, endA: sub });
        runKind = kind;
        runStart = sub;
      }
      sub += perQ;
    }
    if (runKind !== null) arcs.push({ kind: runKind, startA: runStart, endA: sub });
    const midA = startA + (endA - startA) / 2;
    const [lx, ly] = pt(cx, cy, labelR, midA);
    segments.push({
      subject: s,
      startA,
      endA,
      midA,
      arcs,
      label: { x: lx, y: ly },
      span: endA - startA,
    });
    cursor = endA + effectiveGap;
  }

  const LABEL_MIN_RAD = (12 * Math.PI) / 180;
  const interactive = typeof onSliceClick === 'function';

  return (
    <section className={`progress-donut${compact ? ' compact' : ''}`}>
      <div className="donut-wrap">
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          role="img"
          aria-label={`Question progress: ${data.practiced} of ${data.total} practiced`}
        >
          {segments.map((seg) =>
            seg.arcs.map((a, i) => {
              const props = interactive
                ? {
                    onClick: () => onSliceClick(seg.subject.subject),
                    role: 'button',
                    tabIndex: 0,
                    onKeyDown: (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSliceClick(seg.subject.subject);
                      }
                    },
                  }
                : {};
              return (
                <path
                  key={`${seg.subject.subject}-${i}-${a.kind}`}
                  d={annularSector(cx, cy, rOuter, rInner, a.startA, a.endA)}
                  fill={DONUT_COLORS[a.kind]}
                  className={`donut-segment${interactive ? '' : ' static'}`}
                  {...props}
                >
                  <title>
                    {`${seg.subject.subject} — ${seg.subject.practiced} practiced, ${seg.subject.read} read, ${seg.subject.none} not started (${seg.subject.total} total).`}
                  </title>
                </path>
              );
            })
          )}
          {segments.map((seg) =>
            seg.span < LABEL_MIN_RAD ? null : (
              <text
                key={`lbl-${seg.subject.subject}`}
                x={seg.label.x}
                y={seg.label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="donut-label"
                onClick={
                  interactive ? () => onSliceClick(seg.subject.subject) : undefined
                }
                style={interactive ? { cursor: 'pointer' } : undefined}
              >
                {seg.subject.subjectCode}
              </text>
            )
          )}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="donut-center-main"
          >
            {data.practiced} / {data.total}
          </text>
        </svg>
      </div>
      {showLegend && (
        <ul className="donut-legend">
          <li>
            <i style={{ background: DONUT_COLORS.practiced }} /> Practiced ({data.practiced})
          </li>
          <li>
            <i style={{ background: DONUT_COLORS.read }} /> Read passively ({data.read})
          </li>
          <li>
            <i style={{ background: DONUT_COLORS.none }} /> Not started ({data.none})
          </li>
          {hint && <li className="donut-hint muted">{hint}</li>}
        </ul>
      )}
    </section>
  );
}
