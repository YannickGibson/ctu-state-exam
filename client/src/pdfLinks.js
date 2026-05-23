// Rewrite `/pdfs/foo.pdf#page=N` to the vendored PDF.js viewer so the page
// anchor is honored on mobile browsers — Chrome/Brave/Safari on Android and
// iOS ignore `#page=` in their native PDF viewers, but PDF.js handles it.
// `.md` sources go through the in-app MarkdownViewerPage instead, so they
// render as a page rather than triggering a download.
export function toPdfjsHref(href) {
  if (!href || !href.startsWith('/pdfs/')) return href;
  const hashIdx = href.indexOf('#');
  const path = hashIdx === -1 ? href : href.slice(0, hashIdx);
  const hash = hashIdx === -1 ? '' : href.slice(hashIdx);
  if (/\.md$/i.test(path)) {
    return `/md-viewer?file=${encodeURIComponent(path)}${hash}`;
  }
  return `/pdfjs/web/viewer.html?file=${encodeURIComponent(path)}${hash}`;
}
