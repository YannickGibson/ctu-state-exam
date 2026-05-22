// Pure quiz-grading helpers. Extracted from QuizRunnerPage so they can be
// unit-tested without rendering the page.

export function normalize(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, '');
}

export function normalizeList(value) {
  return normalize(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .sort()
    .join(',');
}

export function textIsCorrect(part, input) {
  if (part.compare === 'list') {
    return normalizeList(input) === normalizeList(part.correctAnswer);
  }
  return normalize(input) === normalize(part.correctAnswer);
}

// Normalize old single-shape questions into the same multipart form.
export function asParts(q) {
  if (Array.isArray(q.parts)) return q.parts;
  return [
    {
      label: '',
      prompt: '',
      kind: 'choice',
      choices: q.choices || [],
      correctIndex: q.correctIndex,
      explanation: q.explanation,
    },
  ];
}

export function partKey(qi, pi) {
  return `${qi}:${pi}`;
}

export function partIsAnswered(part, value) {
  if (part.kind === 'text') return typeof value === 'string' && value.trim().length > 0;
  return Number.isInteger(value);
}

export function partIsCorrect(part, value) {
  if (part.kind === 'text') return textIsCorrect(part, value);
  return value === part.correctIndex;
}
