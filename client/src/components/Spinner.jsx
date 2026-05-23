import { RefreshCw } from 'lucide-react';

// Centered loading spinner — lucide's two-arrow RefreshCw icon, rotating.
// Fixed to the viewport so it sits dead-center regardless of how much
// content the calling page has rendered yet.
export default function Spinner() {
  return (
    <div className="spinner-screen" role="status" aria-label="Loading">
      <RefreshCw className="spinner-svg" size={48} aria-hidden />
    </div>
  );
}
