import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { supabase } from '../supabaseClient.js';
import { slugify } from '../markdownSlug.js';
import {
  normalizeBlockquoteMath,
  splitTopLevelPages,
  findTargetPage,
} from '../markdownPrep.js';

function dirOf(filePath) {
  const idx = filePath.lastIndexOf('/');
  return idx === -1 ? '' : filePath.slice(0, idx + 1);
}

function nodeText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (node.props && node.props.children) return nodeText(node.props.children);
  return '';
}

// Cheap height estimate so unmounted pages reserve a realistic block of
// space upfront — keeps the total document height stable and prevents the
// scrollbar/viewport from jumping when surrounding pages mount in. Empirical
// rule of thumb: ~28px per markdown line plus 220px per image, clamped so
// every page reserves at least ~600px.
function estimatePageHeight(markdown) {
  if (!markdown) return 600;
  const lines = markdown.split('\n').length;
  const images = (markdown.match(/!\[/g) || []).length;
  return Math.max(600, lines * 28 + images * 220);
}

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

export default function MarkdownViewerPage() {
  const [params] = useSearchParams();
  const file = params.get('file') || '';
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(() => new Set());
  const baseDir = useMemo(() => dirOf(file), [file]);

  useEffect(() => {
    let cancelled = false;
    if (!file) {
      setError('No file specified.');
      return;
    }
    if (!file.startsWith('/pdfs/') || !/\.md$/i.test(file)) {
      setError('Refusing to load a non-markdown or off-origin file.');
      return;
    }
    setContent(null);
    setError(null);
    setMounted(new Set());
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        const res = await fetch(file, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const text = await res.text();
        if (!cancelled) setContent(normalizeBlockquoteMath(text));
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  const pages = useMemo(() => (content ? splitTopLevelPages(content) : []), [content]);

  const heights = useMemo(() => pages.map(estimatePageHeight), [pages]);

  const targetIdx = useMemo(() => {
    if (!pages.length) return 0;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    return findTargetPage(pages, hash);
  }, [pages]);

  // Mount strategy: target page first, then progressively mount everything
  // *below* it one frame at a time. Pages *above* the target mount lazily
  // via IntersectionObserver — eagerly preloading them would resize content
  // upstream of the viewport, which (even with `overflow-anchor: auto` doing
  // a good job at keeping pixels stable) causes a visible scrollbar dance
  // as estimates settle to real heights. Mounting only when the user
  // approaches the placeholder makes a single small jump per page instead.
  useEffect(() => {
    if (!pages.length) return;
    setMounted(new Set([targetIdx]));
    const below = [];
    for (let i = targetIdx + 1; i < pages.length; i++) below.push(i);
    let i = 0;
    let raf = 0;
    const tick = () => {
      if (i >= below.length) return;
      const next = below[i++];
      setMounted((prev) => {
        if (prev.has(next)) return prev;
        const out = new Set(prev);
        out.add(next);
        return out;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pages, targetIdx]);

  // Pages above the target stay as placeholders until either:
  //   (1) the user interacts (wheel/touch/key), in which case IO takes over
  //       and mounts them as they approach the viewport, or
  //   (2) 3s of inactivity pass after the target lands — assumed to mean
  //       the user is reading, so we background-mount above pages one by
  //       one with manual scrollY compensation. Result: scrolling up is
  //       smooth because everything's already loaded by then.
  const placeholderRefs = useRef(new Map());
  const [userInteracted, setUserInteracted] = useState(false);

  // `expectingMount` flags renders triggered by code-initiated above-page
  // mounts. The compensation useLayoutEffect only adjusts scrollY when this
  // flag is set, so user scrolls don't get countered.
  const expectingMount = useRef(false);

  function mountAbove(idx) {
    expectingMount.current = true;
    setMounted((prev) => {
      if (prev.has(idx)) return prev;
      const out = new Set(prev);
      out.add(idx);
      return out;
    });
  }

  useEffect(() => {
    const onInteract = () => setUserInteracted(true);
    const opts = { passive: true, once: true };
    window.addEventListener('wheel', onInteract, opts);
    window.addEventListener('touchstart', onInteract, opts);
    window.addEventListener('keydown', onInteract, { once: true });
    return () => {
      window.removeEventListener('wheel', onInteract);
      window.removeEventListener('touchstart', onInteract);
      window.removeEventListener('keydown', onInteract);
    };
  }, []);

  // Background preload of above pages. Starts 3s after target mounts;
  // cancels on user interaction. The IO below takes over for anything
  // still unmounted at that point.
  useEffect(() => {
    if (!pages.length || !mounted.has(targetIdx) || userInteracted) return;
    let cancelled = false;
    let timer = 0;
    timer = setTimeout(function startBackgroundMount() {
      let i = targetIdx - 1;
      function tick() {
        if (cancelled || i < 0) return;
        mountAbove(i);
        i--;
        if (i >= 0) timer = setTimeout(tick, 150);
      }
      tick();
    }, 3000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, targetIdx, mounted.has(targetIdx), userInteracted]);

  // IO fallback for above pages not yet covered by the background preload
  // (e.g. user starts scrolling before the 3s timer fires, or before all
  // above pages have been mounted). Mounts directly without setting
  // `expectingMount`, so the compensation effect doesn't fire — once the
  // user is actively scrolling, browser scroll-anchoring (overflow-anchor:
  // auto) handles keeping their visible content stable better than locking
  // to a target heading they've likely scrolled past.
  useEffect(() => {
    if (!pages.length || !userInteracted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const idx = Number(e.target.getAttribute('data-page-idx'));
          setMounted((prev) => {
            if (prev.has(idx)) return prev;
            const out = new Set(prev);
            out.add(idx);
            return out;
          });
          observer.unobserve(e.target);
        }
      },
      { rootMargin: '300px 0px' }
    );
    for (const [idx, el] of placeholderRefs.current) {
      if (el && idx < targetIdx) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [pages, targetIdx, userInteracted]);

  // After any code-initiated above-page mount, measure the target heading's
  // viewport position and compensate scrollY so the user's view stays put.
  // Below-page mounts don't shift the target so this is a no-op for them
  // (delta ~0). User-scroll-initiated layout doesn't set `expectingMount`,
  // so scrolling never gets countered.
  const targetTopRef = useRef(null);
  useLayoutEffect(() => {
    if (!pages.length || !mounted.has(targetIdx)) {
      targetTopRef.current = null;
      return;
    }
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash) return;
    let el = null;
    const pageMatch = /^page=(\d+)$/.exec(hash);
    if (pageMatch) {
      const idx = Math.max(1, parseInt(pageMatch[1], 10)) - 1;
      el = document.querySelectorAll('.md-viewer h1')[idx] || null;
    } else {
      el = document.getElementById(hash);
    }
    if (!el) return;
    const currentTop = el.getBoundingClientRect().top;
    if (expectingMount.current && targetTopRef.current !== null) {
      const delta = currentTop - targetTopRef.current;
      if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
    }
    expectingMount.current = false;
    targetTopRef.current = el.getBoundingClientRect().top;
  }, [mounted, pages, targetIdx]);

  useEffect(() => {
    if (!content) return;
    document.title = file ? file.split('/').pop() : 'Markdown';
  }, [content, file]);

  // Scroll to the deep-link target exactly once, on the frame after the
  // target page mounts. No retry loop — placeholder heights keep the layout
  // stable enough that a single jump lands cleanly, and the browser's
  // scroll-anchoring handles small drift as neighbouring pages mount in.
  useEffect(() => {
    if (!pages.length || !mounted.has(targetIdx)) return;
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (!hash) return;
    function jump() {
      const pageMatch = /^page=(\d+)$/.exec(hash);
      let el = null;
      if (pageMatch) {
        const idx = Math.max(1, parseInt(pageMatch[1], 10)) - 1;
        el = document.querySelectorAll('.md-viewer h1')[idx] || null;
      } else {
        el = document.getElementById(hash);
      }
      if (el) el.scrollIntoView({ block: 'start' });
    }
    const raf = requestAnimationFrame(jump);
    return () => cancelAnimationFrame(raf);
    // Run only when the target page first mounts; ignore later additions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, targetIdx, mounted.has(targetIdx)]);

  function resolveSrc(src) {
    if (!src) return src;
    if (/^([a-z]+:)?\/\//i.test(src) || src.startsWith('/') || src.startsWith('data:')) {
      return src;
    }
    return baseDir + src;
  }

  function HeadingRenderer({ level, children }) {
    const Tag = `h${level}`;
    const id = slugify(nodeText(children));
    return <Tag id={id}>{children}</Tag>;
  }

  const components = {
    img: ({ src, alt, ...rest }) => (
      <img src={resolveSrc(src)} alt={alt} loading="lazy" decoding="async" {...rest} />
    ),
    a: ({ href, children, ...rest }) => {
      const isAnchor = href && href.startsWith('#');
      if (isAnchor) {
        return (
          <a href={href} {...rest}>
            {children}
          </a>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
          {children}
        </a>
      );
    },
    h1: (props) => <HeadingRenderer level={1} {...props} />,
    h2: (props) => <HeadingRenderer level={2} {...props} />,
    h3: (props) => <HeadingRenderer level={3} {...props} />,
    h4: (props) => <HeadingRenderer level={4} {...props} />,
    h5: (props) => <HeadingRenderer level={5} {...props} />,
    h6: (props) => <HeadingRenderer level={6} {...props} />,
  };

  if (error) {
    return (
      <article className="md-viewer">
        <p className="error">Error: {error}</p>
      </article>
    );
  }
  if (!content) return <p className="muted">Loading…</p>;

  return (
    <article className="md-viewer">
      <div className="md-viewer-meta">
        <span className="muted">{file}</span>
        <a href={file} target="_blank" rel="noopener noreferrer" className="ghost">
          Stáhnout zdroj
        </a>
      </div>
      {pages.map((page, i) => {
        const isMounted = mounted.has(i);
        return (
          <section
            key={i}
            className="md-viewer-page"
            data-page={i + 1}
            data-page-idx={i}
            ref={(el) => {
              if (el) placeholderRefs.current.set(i, el);
              else placeholderRefs.current.delete(i);
            }}
            style={
              isMounted
                ? { containIntrinsicSize: `auto ${heights[i]}px` }
                : { minHeight: heights[i], containIntrinsicSize: `auto ${heights[i]}px` }
            }
          >
            {isMounted ? (
              <ReactMarkdown
                remarkPlugins={REMARK_PLUGINS}
                rehypePlugins={REHYPE_PLUGINS}
                components={components}
              >
                {page}
              </ReactMarkdown>
            ) : null}
          </section>
        );
      })}
    </article>
  );
}
