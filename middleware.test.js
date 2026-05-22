import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import middleware, { config } from './middleware.js';

// Minimal stand-in for the Edge Request object: only headers.get('cookie')
// is used by the middleware.
function req(cookie) {
  return { headers: { get: (name) => (name === 'cookie' ? cookie : null) } };
}

beforeEach(() => {
  process.env.SUPABASE_URL = 'https://project.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Edge middleware — static asset gate (#2)', () => {
  it('only matches the protected static paths', () => {
    expect(config.matcher).toEqual(['/pdfs/:path*', '/answer-imgs/:path*']);
  });

  it('returns 401 when there is no cookie at all', async () => {
    const res = await middleware(req(null));
    expect(res.status).toBe(401);
  });

  it('returns 401 when the cookie lacks sb_access_token', async () => {
    const res = await middleware(req('other_cookie=value'));
    expect(res.status).toBe(401);
  });

  it('returns 500 when Supabase env vars are missing', async () => {
    delete process.env.SUPABASE_URL;
    const res = await middleware(req('sb_access_token=some-token'));
    expect(res.status).toBe(500);
  });

  it('returns 401 when Supabase rejects the token', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 401 })));
    const res = await middleware(req('sb_access_token=bad-token'));
    expect(res.status).toBe(401);
  });

  it('falls through (returns nothing) when the token is valid', async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const res = await middleware(req('sb_access_token=good-token'));
    expect(res).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://project.supabase.co/auth/v1/user',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer good-token' }),
      })
    );
  });
});
