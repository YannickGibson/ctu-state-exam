export const EXAM_DATE = new Date(2026, 5, 8);

export function daysUntilExam(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    EXAM_DATE.getFullYear(),
    EXAM_DATE.getMonth(),
    EXAM_DATE.getDate()
  );
  return Math.round((target - today) / 86_400_000);
}

export function formatExamDate() {
  return EXAM_DATE.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
