import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, ChevronDown } from 'lucide-react';
import { getQuestions, getQuestion } from '../api.js';
import { supabase } from '../supabaseClient.js';
import { subjectHue } from '../config/subjects.js';
import { findActiveSentence } from '../audioSync.js';
import InlineMarkdown from '../components/InlineMarkdown.jsx';
import Spinner from '../components/Spinner.jsx';

// Continuous-playback "podcast" of every narrated answer in order.
//
// Playlist model: each question expands into up to three tracks —
//   1. subject intro (only when the subjectCode changes from the previous q)
//   2. question intro ("M P I, Otázka číslo N.")
//   3. question main (the existing per-question narration MP3)
// All MP3s live in the public `answer-audio` Supabase Storage bucket; the
// intros sit under the `intros/` key prefix and are produced by
// scripts/generate-podcast-intros.js. We swap `<audio>.src` on `ended` and
// pre-fetch the next track via a sibling hidden audio.
//
// Transcript is collapsed by default at every level (subject, question,
// sentence). Auto-scrolling on active change is intentionally NOT done —
// the user can browse freely while audio plays.

function audioUrlFor(key) {
  return supabase.storage.from('answer-audio').getPublicUrl(`${key}.mp3`).data.publicUrl;
}

function buildTracks(questions) {
  const tracks = [];
  let prevSubject = null;
  for (const q of questions) {
    if (q.subjectCode !== prevSubject) {
      tracks.push({
        kind: 'subjectIntro',
        subjectCode: q.subjectCode,
        key: `intros/subject-${q.subjectCode}`,
      });
      prevSubject = q.subjectCode;
    }
    tracks.push({
      kind: 'questionIntro',
      subjectCode: q.subjectCode,
      questionId: q.id,
      key: `intros/q-${q.subjectCode}-${q.subjectIndex}`,
    });
    tracks.push({
      kind: 'questionMain',
      subjectCode: q.subjectCode,
      questionId: q.id,
      key: q.id,
    });
  }
  return tracks;
}

function groupBySubject(questions) {
  const groups = [];
  let last = null;
  for (const q of questions) {
    if (!last || last.code !== q.subjectCode) {
      last = { code: q.subjectCode, subject: q.subject, items: [] };
      groups.push(last);
    }
    last.items.push(q);
  }
  return groups;
}

export default function PodcastPage() {
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState(() => new Set());
  const [expandedQuestions, setExpandedQuestions] = useState(() => new Set());
  // questionId → timing map (sentences[]). Lazy-loaded on question expand.
  const [timings, setTimings] = useState(() => new Map());
  const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);

  const audioRef = useRef(null);
  // First user click flips this; afterwards every src swap auto-plays.
  const userHasPlayedRef = useRef(false);
  // Pending seek (seconds) applied once the new audio's metadata is ready.
  const pendingSeekRef = useRef(null);

  useEffect(() => {
    document.title = 'Podcast';
    getQuestions()
      .then(setQuestions)
      .catch((e) => setError(e.message));
  }, []);

  const tracks = useMemo(() => (questions ? buildTracks(questions) : []), [questions]);
  const subjects = useMemo(() => (questions ? groupBySubject(questions) : []), [questions]);

  const current = tracks[currentTrackIdx];
  const next = tracks[currentTrackIdx + 1];
  const currentUrl = current ? audioUrlFor(current.key) : null;
  const nextUrl = next ? audioUrlFor(next.key) : null;

  // When the playing track is a questionMain and we already have its timing,
  // tick the activeSentenceIdx every frame. Mirrors AnswerAudio.jsx.
  useEffect(() => {
    if (!playing) return undefined;
    if (!current || current.kind !== 'questionMain') {
      setActiveSentenceIdx(-1);
      return undefined;
    }
    const timing = timings.get(current.questionId);
    if (!timing) {
      setActiveSentenceIdx(-1);
      return undefined;
    }
    let frame = requestAnimationFrame(function tick() {
      const audio = audioRef.current;
      if (audio) {
        const idx = findActiveSentence(timing.sentences, audio.currentTime);
        setActiveSentenceIdx((prev) => (prev === idx ? prev : idx));
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, current, timings]);

  // Clear sentence highlight whenever the track changes.
  useEffect(() => {
    setActiveSentenceIdx(-1);
    setFailed(false);
  }, [currentTrackIdx]);

  // Kick playback when the src changes mid-session (track advance, jump, …).
  // On a fresh page load, autoplay is blocked until the user taps Play once
  // — userHasPlayedRef gates that.
  useEffect(() => {
    if (!audioRef.current) return;
    if (userHasPlayedRef.current) {
      audioRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl]);

  function loadTimingFor(questionId) {
    if (timings.has(questionId)) return;
    getQuestion(questionId)
      .then((q) => {
        if (q?.audio) {
          setTimings((prev) => {
            if (prev.has(questionId)) return prev;
            const out = new Map(prev);
            out.set(questionId, q.audio);
            return out;
          });
        }
      })
      .catch(() => {});
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    userHasPlayedRef.current = true;
    if (a.paused) a.play().catch(() => {});
    else a.pause();
  }

  function jumpToTrack(idx) {
    if (idx < 0 || idx >= tracks.length) return;
    userHasPlayedRef.current = true;
    setCurrentTrackIdx(idx);
  }

  function advance() {
    if (currentTrackIdx + 1 < tracks.length) {
      setCurrentTrackIdx(currentTrackIdx + 1);
    } else {
      setPlaying(false);
    }
  }

  function jumpToSubject(code) {
    const idx = tracks.findIndex((t) => t.kind === 'subjectIntro' && t.subjectCode === code);
    if (idx >= 0) jumpToTrack(idx);
  }

  function jumpToQuestion(qid) {
    const idx = tracks.findIndex((t) => t.kind === 'questionIntro' && t.questionId === qid);
    if (idx >= 0) jumpToTrack(idx);
  }

  function jumpToSentence(qid, startSec) {
    const mainIdx = tracks.findIndex((t) => t.kind === 'questionMain' && t.questionId === qid);
    if (mainIdx < 0) return;
    userHasPlayedRef.current = true;
    if (mainIdx === currentTrackIdx) {
      const a = audioRef.current;
      if (a) {
        a.currentTime = startSec;
        a.play().catch(() => {});
      }
    } else {
      pendingSeekRef.current = startSec;
      setCurrentTrackIdx(mainIdx);
    }
  }

  function onLoadedMetadata() {
    if (pendingSeekRef.current != null && audioRef.current) {
      audioRef.current.currentTime = pendingSeekRef.current;
      pendingSeekRef.current = null;
    }
  }

  function toggleSubject(code) {
    setExpandedSubjects((prev) => {
      const out = new Set(prev);
      if (out.has(code)) out.delete(code);
      else out.add(code);
      return out;
    });
  }

  function toggleQuestion(qid) {
    setExpandedQuestions((prev) => {
      const out = new Set(prev);
      if (out.has(qid)) {
        out.delete(qid);
      } else {
        out.add(qid);
        loadTimingFor(qid);
      }
      return out;
    });
  }

  if (error) return <p className="error">Error: {error}</p>;
  if (!questions) return <Spinner />;

  // Position counter: human-readable as "question N / 42" when playing a
  // question-related track; "intro" otherwise.
  const playingQuestionId = current?.kind !== 'subjectIntro' ? current?.questionId : null;
  const playingQuestionIdx = playingQuestionId
    ? questions.findIndex((q) => q.id === playingQuestionId)
    : -1;

  return (
    <article className="podcast">
      <h1 className="podcast-heading">Podcast</h1>
      <p className="muted podcast-subhead">
        All {questions.length} questions, narrated end-to-end with subject and
        question intros. Tap a subject or question to jump.
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
          onLoadedMetadata={onLoadedMetadata}
          onError={() => {
            // Skip a missing intro / track so overnight playback doesn't stall.
            setFailed(true);
            setTimeout(advance, 800);
          }}
        />
        {nextUrl && (
          <audio src={nextUrl} preload="auto" muted style={{ display: 'none' }} />
        )}

        <div className="answer-audio-bar podcast-bar">
          <button
            type="button"
            className="answer-audio-playpause"
            onClick={() => jumpToTrack(currentTrackIdx - 1)}
            disabled={currentTrackIdx === 0}
            aria-label="Previous track"
            title="Previous"
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
            onClick={() => jumpToTrack(currentTrackIdx + 1)}
            disabled={currentTrackIdx >= tracks.length - 1}
            aria-label="Next track"
            title="Next"
          >
            <SkipForward size={18} aria-hidden />
          </button>
          <div className="podcast-now-playing">
            {current && (
              <span
                className="subject-pill"
                style={{ '--subject-hue': subjectHue(current.subjectCode) }}
                title={current.subjectCode}
              >
                {current.subjectCode}
                {current.kind !== 'subjectIntro' &&
                  ` ${questions[playingQuestionIdx]?.subjectIndex ?? ''}`}
              </span>
            )}
            <span className="muted">
              {playingQuestionIdx >= 0
                ? `${playingQuestionIdx + 1} / ${questions.length}`
                : 'intro'}
            </span>
          </div>
        </div>

        {failed && (
          <p className="muted podcast-failed-note">
            That track failed to load — skipping…
          </p>
        )}

        <div className="answer-audio-transcript podcast-transcript">
          {subjects.map((s) => {
            const subjectOpen = expandedSubjects.has(s.code);
            return (
              <div className="podcast-subject" key={s.code}>
                <div className="podcast-row podcast-subject-row">
                  <button
                    type="button"
                    className="podcast-jump podcast-subject-jump"
                    onClick={() => jumpToSubject(s.code)}
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
                  <button
                    type="button"
                    className={`podcast-caret${subjectOpen ? ' is-open' : ''}`}
                    onClick={() => toggleSubject(s.code)}
                    aria-label={subjectOpen ? 'Collapse subject' : 'Expand subject'}
                    aria-expanded={subjectOpen}
                  >
                    <ChevronDown size={20} aria-hidden />
                  </button>
                </div>

                {subjectOpen && (
                  <div className="podcast-subject-children">
                    {s.items.map((q) => {
                      const questionOpen = expandedQuestions.has(q.id);
                      const isPlayingThis = playingQuestionId === q.id;
                      const timing = timings.get(q.id);
                      return (
                        <div className="podcast-question" key={q.id}>
                          <div className="podcast-row podcast-question-row">
                            <button
                              type="button"
                              className={`podcast-jump audio-sentence${isPlayingThis ? ' is-active' : ''}`}
                              onClick={() => jumpToQuestion(q.id)}
                              title={`Jump to ${q.subjectCode} ${q.subjectIndex}`}
                            >
                              <strong>
                                {q.subjectCode} {q.subjectIndex}.
                              </strong>{' '}
                              {q.text}
                            </button>
                            <button
                              type="button"
                              className={`podcast-caret${questionOpen ? ' is-open' : ''}`}
                              onClick={() => toggleQuestion(q.id)}
                              aria-label={questionOpen ? 'Collapse question' : 'Expand question'}
                              aria-expanded={questionOpen}
                            >
                              <ChevronDown size={18} aria-hidden />
                            </button>
                          </div>

                          {questionOpen && (
                            <div className="podcast-question-children">
                              {!timing && <p className="muted podcast-loading">Loading…</p>}
                              {timing &&
                                timing.sentences.map((sent, i) => (
                                  <button
                                    type="button"
                                    key={i}
                                    className={`audio-sentence podcast-sentence-row${
                                      isPlayingThis && i === activeSentenceIdx ? ' is-active' : ''
                                    }`}
                                    onClick={() => jumpToSentence(q.id, sent.start)}
                                    title="Jump to this sentence"
                                  >
                                    <InlineMarkdown>{sent.text}</InlineMarkdown>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
