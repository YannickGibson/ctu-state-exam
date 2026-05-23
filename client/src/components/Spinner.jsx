// Centered loading spinner — two curved arrows forming a circle, rotating.
// Fixed to the viewport so the spinner sits in the dead center regardless
// of how much (or little) content the calling page has rendered yet.
export default function Spinner() {
  return (
    <div className="spinner-screen" role="status" aria-label="Loading">
      <svg
        className="spinner-svg"
        viewBox="0 0 24 24"
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 0 1-15.3 6.4" />
        <polyline points="9.3 18.3 5.7 18.3 5.7 14.7" />
        <path d="M3 12a9 9 0 0 1 15.3-6.4" />
        <polyline points="14.7 5.7 18.3 5.7 18.3 9.3" />
      </svg>
    </div>
  );
}
