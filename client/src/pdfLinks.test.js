import { describe, it, expect } from 'vitest';
import { toPdfjsHref } from './pdfLinks.js';

describe('toPdfjsHref', () => {
  it('rewrites a plain /pdfs/ URL through the PDF.js viewer', () => {
    expect(toPdfjsHref('/pdfs/SPOL/MPI_Merged.pdf')).toBe(
      '/pdfjs/web/viewer.html?file=%2Fpdfs%2FSPOL%2FMPI_Merged.pdf'
    );
  });

  it('preserves a #page=N anchor (so deep links still jump)', () => {
    expect(toPdfjsHref('/pdfs/SPOL/MPI_Merged.pdf#page=116')).toBe(
      '/pdfjs/web/viewer.html?file=%2Fpdfs%2FSPOL%2FMPI_Merged.pdf#page=116'
    );
  });

  it('encodes spaces and other unsafe chars in the file param', () => {
    expect(toPdfjsHref('/pdfs/foo bar.pdf#page=2')).toBe(
      '/pdfjs/web/viewer.html?file=%2Fpdfs%2Ffoo%20bar.pdf#page=2'
    );
  });

  it('passes through non-pdf URLs unchanged', () => {
    expect(toPdfjsHref('https://example.com')).toBe('https://example.com');
    expect(toPdfjsHref('/other/path')).toBe('/other/path');
  });

  it('routes .md files through the in-app markdown viewer instead of PDF.js', () => {
    expect(toPdfjsHref('/pdfs/ZI/BML/BML_Merged.md')).toBe(
      '/md-viewer?file=%2Fpdfs%2FZI%2FBML%2FBML_Merged.md'
    );
    expect(toPdfjsHref('/pdfs/ZI/SCR/SCR_Merged.md#tema-4')).toBe(
      '/md-viewer?file=%2Fpdfs%2FZI%2FSCR%2FSCR_Merged.md#tema-4'
    );
  });

  it('handles empty / nullish input', () => {
    expect(toPdfjsHref('')).toBe('');
    expect(toPdfjsHref(null)).toBe(null);
    expect(toPdfjsHref(undefined)).toBe(undefined);
  });
});
