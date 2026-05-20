import { useMemo } from 'react';

const COLORS = {
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

export default function ProgressDonut({ questions }) {
  const data = useMemo(() => {
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
        });
      }
      const s = bySubject.get(q.subject);
      s.total++;
      s[classify(q.progress)]++;
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
  }, [questions]);

  if (data.total === 0) {
    return (
      <section className="progress-donut empty">
        <p className="muted">No questions match the current filter.</p>
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
  // Gap between subjects (radians). Scales down if many subjects.
  const gap = Math.min((2 * Math.PI) / 180, TWO_PI / data.subjects.length / 8);
  // Don't draw gaps if there's only one subject.
  const effectiveGap = data.subjects.length > 1 ? gap : 0;

  const segments = [];
  let cursor = 0;
  for (const s of data.subjects) {
    const span = (s.total / data.total) * TWO_PI - effectiveGap;
    const startA = cursor;
    const endA = startA + Math.max(span, 0.0001);
    const arcs = [];
    let sub = startA;
    for (const kind of ['practiced', 'read', 'none']) {
      const count = s[kind];
      if (count === 0) continue;
      const next = sub + (count / s.total) * (endA - startA);
      arcs.push({ kind, startA: sub, endA: next });
      sub = next;
    }
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

  const pct = Math.round((data.practiced / data.total) * 100);
  // Hide labels that won't fit (sector arc too thin).
  const LABEL_MIN_RAD = (12 * Math.PI) / 180;

  return (
    <section className="progress-donut">
      <div className="donut-wrap">
        <svg
          viewBox={`0 0 ${VB} ${VB}`}
          role="img"
          aria-label={`Question progress: ${data.practiced} of ${data.total} practiced`}
        >
          {segments.map((seg) =>
            seg.arcs.map((a) => (
              <path
                key={`${seg.subject.subject}-${a.kind}`}
                d={annularSector(cx, cy, rOuter, rInner, a.startA, a.endA)}
                fill={COLORS[a.kind]}
              >
                <title>
                  {`${seg.subject.subject} — ${seg.subject.practiced} practiced, ${seg.subject.read} read, ${seg.subject.none} not started (${seg.subject.total} total)`}
                </title>
              </path>
            ))
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
              >
                {seg.subject.subjectCode}
              </text>
            )
          )}
          <text x={cx} y={cy - 6} textAnchor="middle" className="donut-center-main">
            {data.practiced} / {data.total}
          </text>
          <text x={cx} y={cy + 20} textAnchor="middle" className="donut-center-sub">
            {pct}% practiced
          </text>
        </svg>
      </div>
      <ul className="donut-legend">
        <li>
          <i style={{ background: COLORS.practiced }} /> Practiced ({data.practiced})
        </li>
        <li>
          <i style={{ background: COLORS.read }} /> Read passively ({data.read})
        </li>
        <li>
          <i style={{ background: COLORS.none }} /> Not started ({data.none})
        </li>
      </ul>
    </section>
  );
}
