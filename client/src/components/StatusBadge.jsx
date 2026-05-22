// Renders the study-status indicator for a question.
//  - practicedCount === 1 : colored "Practiced" badge.
//  - practicedCount >= 2  : colored "Practiced N×" badge.
//  - readPassively        : a "read passively" badge.
//  - otherwise            : "not started".

function practicedTier(count) {
  if (count >= 3) return 'p3';
  if (count >= 2) return 'p2';
  return 'p1';
}

export default function StatusBadge({ progress }) {
  const { readPassively, practicedCount } = progress || {};

  if (practicedCount >= 1) {
    const tier = practicedTier(practicedCount);
    return (
      <span
        className={`badge practiced ${tier}`}
        title={`Practiced ${practicedCount}x`}
      >
        Practiced{practicedCount >= 2 ? ` ${practicedCount}×` : ''}
      </span>
    );
  }

  if (readPassively) {
    return <span className="badge read">read passively</span>;
  }

  return <span className="badge none">not started</span>;
}
