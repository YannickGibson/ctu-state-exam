import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { getQuestions } from '../api.js';
import { supabase } from '../supabaseClient.js';
import { subjectHue } from '../config/subjects.js';
import Spinner from '../components/Spinner.jsx';

// Continuous-playback "podcast" of every narrated answer in order. Each
// question's MP3 lives on Supabase Storage; we play them back-to-back by
// swapping `<audio>.src` on `ended` and preloading the next track in a
// hidden second audio element so the gap between tracks is just the time
// the browser needs to swap buffers (~tens of ms with a warm cache).
//
// Intended for overnight passive listening. Click any subject header to
// jump to the first question of that subject; click any question to jump
// directly to it.

function audioUrlFor(questionId) {
  return supabase.storage.from('answer-audio').getPublicUrl(`${questionId}.mp3`).data.publicUrl;
}

function groupBySubject(questions) {
  const groups = [];
  let last = null;
  questions.forEach((q, idx) => {
    if (!last || last.code !== q.subjectCode) {
      last = {
        code: q.subjectCode,
        group: q.group,
        subject: q.subject,
        firstIdx: idx,
        items: [],
      };
      groups.push(last);
    }
    last.items.push({ ...q, idx });
  });
  return groups;
}

export default function PodcastPage() {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);
  // Track whether a track change is the user's first interaction. Browsers
  // block `autoplay` until then; once the user clicks play once, subsequent
  // src swaps autoplay fine.
  const userHasPlayedRef = useRef(false);

  useEffect(() => {
    document.title = 'Podcast';
    getQuestions()
      .then(setQuestions)
      .catch((e) => setError(e.message));
  }, []);

  const subjects = useMemo(() => (questions ? groupBySubject(questions) : []), [questions]);

  const current = questions?.[currentIdx];
  const next = questions?.[currentIdx + 1];
  const currentUrl = current ? audioUrlFor(current.id) : null;
  const nextUrl = next ? audioUrlFor(next.id) : null;

  // Keep the active question in view as the playlist auto-advances.
  useEffect(() => {
    if (!transcriptRef.current) return;
    const el = transcriptRef.current.querySelector('.audio-sentence.is-active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [currentIdx]);

  // When `currentIdx` changes mid-play (advance on `ended` or jump from
  // playlist click), nudge the audio element to start playing. autoPlay
  // covers the case where the user clicked something — but not the initial
  // mount, which has to wait for the first play click anyway.
  useEffect(() => {
    if (!current || !audioRef.current) return;
    setFailed(false);
    if (userHasPlayedRef.current) {
      audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, currentUrl]);

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    userHasPlayedRef.current = true;
    if (a.paused) {
      a.play().catch(() => {});
    } else {
      a.pause();
    }
  }

  function jumpTo(idx) {
    if (idx < 0 || idx >= (questions?.length ?? 0)) return;
    userHasPlayedRef.current = true;
    setCurrentIdx(idx);
  }

  function advance() {
    if (currentIdx + 1 < (questions?.length ?? 0)) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setPlaying(false);
    }
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!questions) return <Spinner />;

  return (
    <article className="podcast">
      <h1 className="podcast-heading">Podcast</h1>
      <p className="muted podcast-subhead">
        All {questions.length} questions, narrated end-to-end. Tap a subject or a
        question to jump.
      </p>

      <div className="answer-audio-panel">
        <audio
          ref={audioRef}
          src={currentUrl ?? undefined}
          autoPlay
          preload="auto"
          style={{ display: 'none' }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={advance}
          onError={() => {
            // If one MP3 isn't uploaded yet, skip to the next so overnight
            // playback isn't blocked. Show a small inline note.
            setFailed(true);
            setTimeout(advance, 800);
          }}
        />
        {/* Hidden preloader for the next track. The browser fetches the URL
            when `preload="auto"` is set; by the time the current track ends
            and we swap src, it's already in the HTTP cache. */}
        {nextUrl && (
          <audio src={nextUrl} preload="auto" muted style={{ display: 'none' }} />
        )}

        <div className="answer-audio-bar podcast-bar">
          <button
            type="button"
            className="answer-audio-playpause"
            onClick={() => jumpTo(currentIdx - 1)}
            disabled={currentIdx === 0}
            aria-label="Previous question"
            title="Previous question"
          >
            <SkipBack size={18} aria-hidden />
          </button>
          <button
            type="button"
            className="answer-audio-playpause"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
          </button>
          <button
            type="button"
            className="answer-audio-playpause"
            onClick={() => jumpTo(currentIdx + 1)}
            disabled={currentIdx >= questions.length - 1}
            aria-label="Next question"
            title="Next question"
          >
            <SkipForward size={18} aria-hidden />
          </button>
          <div className="podcast-now-playing">
            <span
              className="subject-pill"
              style={{ '--subject-hue': subjectHue(current?.subjectCode) }}
              title={current?.subject}
            >
              {current?.subjectCode} {current?.subjectIndex}
            </span>
            <span className="muted">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </div>

        {failed && (
          <p className="muted podcast-failed-note">
            That track failed to load — skipping…
          </p>
        )}

        <div className="answer-audio-transcript podcast-transcript" ref={transcriptRef}>
          {subjects.map((s) => (
            <div className="podcast-subject" key={s.code}>
              <button
                type="button"
                className="podcast-subject-header"
                onClick={() => jumpTo(s.firstIdx)}
                title={`Jump to start of ${s.subject}`}
              >
                <span
                  className="subject-pill"
                  style={{ '--subject-hue': subjectHue(s.code) }}
                >
                  {s.code}
                </span>
                <span className="podcast-subject-name">{s.subject}</span>
                <span className="muted">
                  {s.items.length} {s.items.length === 1 ? 'question' : 'questions'}
                </span>
              </button>
              <p className="audio-paragraph podcast-questions">
                {s.items.map((q) => (
                  <span
                    key={q.id}
                    role="button"
                    tabIndex={0}
                    className={`audio-sentence${q.idx === currentIdx ? ' is-active' : ''}`}
                    onClick={() => jumpTo(q.idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        jumpTo(q.idx);
                      }
                    }}
                    title={`Jump to ${q.subjectCode} ${q.subjectIndex}`}
                  >
                    <strong>{q.subjectCode} {q.subjectIndex}.</strong> {q.text}
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
