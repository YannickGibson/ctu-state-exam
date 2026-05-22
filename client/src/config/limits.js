// Hard cap on how many times a question can be marked practiced / revised.
// Enforced server-side by least(..., N) in the bump_practiced function
// (see docs/supabase-setup.md); this constant only drives the UI and MUST
// match that value.
export const MAX_PRACTICED = 3;
