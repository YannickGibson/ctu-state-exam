// Renders the study-status indicator for a question.
//  - practicedCount >= 1 : colored badge with the count.
//      The "Practiced" label is hidden at count 1 and shown only at count >= 2.
//  - readPassively       : a "read passively" badge.
//  - otherwise           : "not started".

function practicedTier(count) {
  if (count >= 4) return 'p3';
  if (count >= 2) return 'p2';
  return 'p1';
}

export default function StatusBadge({ progress }) {
  const { readPassively, practicedCount } = progress || {};

  if (practicedCount >= 1) {
    const showLabel = practicedCount >= 2;
    return (
      <span
        className={`badge practiced ${practicedTier(practicedCount)}`}
        title={`Practiced ${practicedCount}x`}
      >
        {showLabel ? `Practiced ${practicedCount}×` : practicedCount}
      </span>
    );
  }

  if (readPassively) {
    return <span className="badge read">read passively</span>;
  }

  return <span className="badge none">not started</span>;
}
