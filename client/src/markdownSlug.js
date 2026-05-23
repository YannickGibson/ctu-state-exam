// Heading-text → URL slug. GitHub-style enough that links in answer markdown
// can be hand-written, but normalized so Czech diacritics and lecture-title
// underscores produce predictable IDs.
export function slugify(text) {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
