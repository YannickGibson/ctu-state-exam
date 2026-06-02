// Allowlist for the private Committee tab. Kept in one place so the nav link
// (App.jsx) and the route gate (RequireUsername) agree. The server enforces the
// same list independently in /api/committee — this is only UI gating.
export const COMMITTEE_ALLOW = ['gibsoyan', 'kvasvojt'];

export const isCommitteeUser = (username) =>
  Boolean(username) && COMMITTEE_ALLOW.includes(username);
