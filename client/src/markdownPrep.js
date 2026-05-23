import { slugify } from './markdownSlug.js';

// The BML / SCR merged notebooks contain blockquote "Definition" boxes whose
// $$...$$ math blocks straddle the blockquote (`> $$` opens, then the math
// body has no `>` prefix, then `$$` closes). remark-math can't pair the
// fences across that boundary and the math renders raw. Lift the body and
// closing fence out of the blockquote so the block parses normally.
export function normalizeBlockquoteMath(text) {
  const lines = text.split('\n');
  const out = [];
  let inMath = false;
  for (const raw of lines) {
    const trimmed = raw.replace(/^>\s?/, '');
    const isFence = /^\s*\$\$\s*$/.test(trimmed);
    if (isFence) {
      out.push('$$');
      inMath = !inMath;
      continue;
    }
    if (inMath) {
      out.push(trimmed);
    } else {
      out.push(raw);
    }
  }
  return out.join('\n');
}

// Split markdown by top-level `# ` headings into "pages". Each page includes
// its leading heading line so the heading still renders within the page.
// Lines before the first `# ` (preamble) become page 0.
export function splitTopLevelPages(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const pages = [];
  let current = [];
  let inFence = false;
  for (const line of lines) {
    // Don't split inside fenced code blocks (``` ... ```).
    if (/^```/.test(line)) inFence = !inFence;
    if (!inFence && /^# (?!#)/.test(line)) {
      if (current.length) pages.push(current.join('\n'));
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length) pages.push(current.join('\n'));
  return pages.filter((p) => p.trim().length > 0);
}

// Locate which page index a deep-link hash refers to.
//   #page=N   → N-1 (0-indexed), counting from the first `#`-heading page
//                 (preamble is page 0 only when present).
//   #slug     → first page whose heading or any heading inside slugifies to it.
// Returns 0 when nothing matches.
export function findTargetPage(pages, hash) {
  if (!pages.length || !hash) return 0;
  const pageMatch = /^page=(\d+)$/.exec(hash);
  if (pageMatch) {
    // 1-indexed; clamp to range.
    const requested = Math.max(1, parseInt(pageMatch[1], 10));
    return Math.min(requested - 1, pages.length - 1);
  }
  for (let i = 0; i < pages.length; i++) {
    const headings = pages[i].match(/^#{1,6} .+$/gm) || [];
    for (const h of headings) {
      const text = h.replace(/^#+\s+/, '');
      if (slugify(text) === hash) return i;
    }
  }
  return 0;
}
