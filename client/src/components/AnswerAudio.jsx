import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { supabase } from '../supabaseClient.js';
import { findActiveSentence } from '../audioSync.js';
import InlineMarkdown from './InlineMarkdown.jsx';

// Narrated-answer player panel.
//
// - The MP3 is hosted on Supabase Storage (public bucket `answer-audio`); the
//   sentence timing map (`timing`) is bundled into the question API response.
// - The <audio> element is hidden — playback is driven only by the play/pause
//   control and by clicking transcript sentences, so there is no native
//   scrubber to confuse users.
// - The sentence highlight is driven by a requestAnimationFrame loop while
//   playing, so it always tracks the real playback position (including
//   immediately after a seek).
//
// Mounted only while the panel is open; unmounting stops playback.
export default function AnswerAudio({ questionId, timing }) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const audioRef = useRef(null);
  const transcriptRef = useRef(null);

  const audioUrl = supabase.storage
    .from('answer-audio')
    .getPublicUrl(`${questionId}.mp3`).data.publicUrl;

  // Track the spoken sentence on every animation frame while playing.
  useEffect(() => {
    if (!playing) return undefined;
    let frame = requestAnimationFrame(function tick() {
      const audio = audioRef.current;
      if (audio) {
        const idx = findActiveSentence(timing.sentences, audio.currentTime);
        setActiveIdx((prev) => (prev === idx ? prev : idx));
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [playing, timing]);

  // Keep the highlighted sentence visible within the scrollable transcript.
  useEffect(() => {
    if (activeIdx < 0 || !transcriptRef.current) return;
    const el = transcriptRef.current.children[activeIdx];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  function syncNow() {
    const audio = audioRef.current;
    if (audio) setActiveIdx(findActiveSentence(timing.sentences, audio.currentTime));
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (audio.ended) audio.currentTime = 0;
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function seekTo(i) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = timing.sentences[i].start;
    setActiveIdx(i);
    audio.play().catch(() => {});
  }

  return (
    <div className="answer-audio-panel">
      <audio
        ref={audioRef}
        src={audioUrl}
        autoPlay
        preload="auto"
        style={{ display: 'none' }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          syncNow();
        }}
        onSeeked={syncNow}
        onError={() => setFailed(true)}
      />
      {failed ? (
        <p className="error">
          Narration audio could not be loaded — it may not be uploaded yet. Run{' '}
          <code>node scripts/upload-audio.js {questionId}</code>.
        </p>
      ) : (
        <>
          <div className="answer-audio-bar">
            <button
              type="button"
              className="answer-audio-playpause"
              onClick={togglePlay}
              aria-label={playing ? 'Pause narration' : 'Play narration'}
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={18} aria-hidden /> : <Play size={18} aria-hidden />}
            </button>
            <span className="muted answer-audio-hint">Click any sentence to jump to it.</span>
          </div>
          <div className="answer-audio-transcript" ref={transcriptRef}>
            {timing.sentences.map((s, i) => (
              <button
                type="button"
                key={i}
                className={`audio-sentence${i === activeIdx ? ' is-active' : ''}`}
                onClick={() => seekTo(i)}
                title="Jump to this sentence"
              >
                <InlineMarkdown>{s.text}</InlineMarkdown>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
