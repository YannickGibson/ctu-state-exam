/*
 * Vercel Edge Middleware — gates static asset paths.
 *
 * In production, /pdfs and /answer-imgs are served by Vercel's static CDN
 * (scripts/copy-static.js copies them into client/dist/), so Express's
 * requireAuth never sees those requests. This file runs at the edge before
 * the CDN serves the asset, reads the same sb_access_token cookie that
 * Express uses, and verifies it against Supabase.
 *
 * Local dev (npm run dev) does NOT execute this — it only runs on Vercel
 * (or under `vercel dev`). Express's requireAuth covers those paths in dev.
 */

export const config = {
  matcher: ['/pdfs/:path*', '/answer-imgs/:path*'],
};

function readCookie(cookieHeader, name) {
  if (!cookieHeader) return null;
  const m = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}

export default async function middleware(request) {
  const token = readCookie(request.headers.get('cookie'), 'sb_access_token');
  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error('middleware: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
    return new Response('Misconfigured', { status: 500 });
  }

  // One HTTP round-trip per asset. If this becomes a bottleneck on pages with
  // many images, switch to local JWT verification with `jose` + SUPABASE_JWT_SECRET.
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: key,
    },
  });
  if (!r.ok) {
    return new Response('Unauthorized', { status: 401 });
  }
  // Fall through — Vercel's static layer serves the file.
}
