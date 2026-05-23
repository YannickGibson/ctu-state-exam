export const EXAM_DATE = new Date(2026, 5, 1);

function toDate(input) {
  if (input instanceof Date) return input;
  if (typeof input === 'string' && input) {
    const [y, m, d] = input.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return EXAM_DATE;
}

export function daysUntilExam(target, now = new Date()) {
  const t = toDate(target);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const at = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((at - today) / 86_400_000);
}

export function formatExamDate(target) {
  return toDate(target).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function toExamDateInputValue(target) {
  const t = toDate(target);
  const yyyy = t.getFullYear();
  const mm = String(t.getMonth() + 1).padStart(2, '0');
  const dd = String(t.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
