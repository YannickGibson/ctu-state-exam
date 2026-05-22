import { useEffect, useState } from 'react';
import { Check, Eye, RotateCcw } from 'lucide-react';
import { MAX_PRACTICED } from '../config/limits.js';

function practicedTier(count) {
  if (count >= 3) return 'p3';
  if (count >= 2) return 'p2';
  return 'p1';
}

export default function QuestionActions({ progress, onAction, compact = false, disabled = false }) {
  const { practicedCount = 0, readPassively = false } = progress || {};
  const hasProgress = practicedCount > 0 || readPassively;
  const showReset = hasProgress;
  const showEye = !hasProgress;
  const [pulse, setPulse] = useState(false);

  // Clear the pulse flag once the animation has played.
  useEffect(() => {
    if (!pulse) return undefined;
    const t = setTimeout(() => setPulse(false), 260);
    return () => clearTimeout(t);
  }, [pulse]);

  const fire = (event, action) => {
    event.stopPropagation();
    event.preventDefault();
    if (disabled) return;
    // Pulse only on a real click, not when navigation loads an existing count.
    if (action === 'practice') setPulse(true);
    onAction(action);
  };

  const tierClass = practicedCount > 0 ? ` ${practicedTier(practicedCount)}` : '';
  const compactClass = compact ? ' compact' : '';
  const atCap = practicedCount >= MAX_PRACTICED;

  return (
    <div className={`q-actions${compactClass}`}>
      <button
        type="button"
        className={`q-action-btn check${tierClass}${practicedCount > 0 ? ' count' : ''}`}
        onClick={(e) => fire(e, 'practice')}
        disabled={disabled || atCap}
        data-just-changed={pulse ? 'true' : 'false'}
        title={
          atCap
            ? `Practiced ${practicedCount}/${MAX_PRACTICED} — max reached`
            : practicedCount > 0
              ? `Practiced ${practicedCount}× — click to add one`
              : 'Mark practiced'
        }
        aria-label={
          atCap
            ? `Practiced ${practicedCount} of ${MAX_PRACTICED}, maximum reached`
            : practicedCount > 0
              ? `Practiced ${practicedCount} times, click to add one`
              : 'Mark practiced'
        }
      >
        {practicedCount > 0 ? (
          <span className="q-action-count">{practicedCount}</span>
        ) : (
          <Check size={compact ? 16 : 18} strokeWidth={2.5} aria-hidden />
        )}
      </button>

      {showEye && (
        <button
          type="button"
          className="q-action-btn eye"
          onClick={(e) => fire(e, 'readPassively')}
          disabled={disabled}
          title="Mark read passively"
          aria-label="Mark read passively"
        >
          <Eye size={compact ? 16 : 18} strokeWidth={2.25} aria-hidden />
        </button>
      )}

      {showReset && (
        <button
          type="button"
          className="q-action-btn reset"
          onClick={(e) => fire(e, 'reset')}
          disabled={disabled}
          title="Reset progress"
          aria-label="Reset progress"
        >
          <RotateCcw size={compact ? 15 : 17} strokeWidth={2.25} aria-hidden />
        </button>
      )}
    </div>
  );
}
