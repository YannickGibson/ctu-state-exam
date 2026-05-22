import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from './app.js';

// Fake Supabase admin client, injected via app.setSupabaseAdminFactory so no
// real network/auth calls happen.
const auth = {
  getUser: vi.fn(),
  admin: {
    listUsers: vi.fn(),
    createUser: vi.fn(),
    generateLink: vi.fn(),
  },
};
app.setSupabaseAdminFactory(() => ({ auth }));

const VALID = { data: { user: { id: 'user-1', email: 'u@example.com' } }, error: null };

beforeEach(() => {
  auth.getUser.mockReset();
  auth.admin.listUsers.mockReset();
  auth.admin.createUser.mockReset();
  auth.admin.generateLink.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('requireAuth gate (#1)', () => {
  it('rejects a request with no token (401), without calling Supabase', async () => {
    const res = await request(app).get('/api/questions');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthenticated');
    expect(auth.getUser).not.toHaveBeenCalled();
  });

  it('accepts a valid Bearer token', async () => {
    auth.getUser.mockResolvedValue(VALID);
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', 'Bearer good-token');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(auth.getUser).toHaveBeenCalledWith('good-token');
  });

  it('accepts the same token via the sb_access_token cookie', async () => {
    auth.getUser.mockResolvedValue(VALID);
    const res = await request(app)
      .get('/api/questions')
      .set('Cookie', 'sb_access_token=good-token');
    expect(res.status).toBe(200);
    expect(auth.getUser).toHaveBeenCalledWith('good-token');
  });

  it('rejects a token Supabase reports as invalid (401)', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad jwt' } });
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', 'Bearer expired');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_token');
  });

  it('returns 401 when the Supabase call itself throws', async () => {
    auth.getUser.mockRejectedValue(new Error('network down'));
    const res = await request(app)
      .get('/api/questions')
      .set('Authorization', 'Bearer whatever');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('auth_failed');
  });
});

describe('POST /api/auth/session — cookie sync (#3)', () => {
  it('rejects a body with no access_token (400)', async () => {
    const res = await request(app).post('/api/auth/session').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('missing_access_token');
  });

  it('rejects an invalid token (401) and sets no cookie', async () => {
    auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'bad' } });
    const res = await request(app)
      .post('/api/auth/session')
      .send({ access_token: 'bad' });
    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('sets an httpOnly, lax, 1-hour cookie for a valid token', async () => {
    auth.getUser.mockResolvedValue(VALID);
    const res = await request(app)
      .post('/api/auth/session')
      .send({ access_token: 'good-token' });
    expect(res.status).toBe(200);
    const cookie = res.headers['set-cookie'].find((c) => c.startsWith('sb_access_token='));
    expect(cookie).toContain('sb_access_token=good-token');
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Max-Age=3600\b/);
    expect(cookie).toMatch(/Path=\//);
  });

  it('adds the Secure flag when NODE_ENV is production', async () => {
    auth.getUser.mockResolvedValue(VALID);
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const res = await request(app)
        .post('/api/auth/session')
        .send({ access_token: 'good-token' });
      const cookie = res.headers['set-cookie'].find((c) => c.startsWith('sb_access_token='));
      expect(cookie).toMatch(/Secure/i);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});

describe('GET /api/auth/fit/callback — OAuth state validation (#4)', () => {
  it('redirects with state_mismatch when no state cookie is present', async () => {
    const res = await request(app).get('/api/auth/fit/callback?code=c1&state=s1');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/auth/fit/complete?error=state_mismatch');
  });

  it('redirects with state_mismatch when the cookie does not match the query state', async () => {
    const res = await request(app)
      .get('/api/auth/fit/callback?code=c1&state=s1')
      .set('Cookie', 'fit_oauth_state=DIFFERENT');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('error=state_mismatch');
  });

  it('forwards an error returned by the FIT authorize step', async () => {
    const res = await request(app).get('/api/auth/fit/callback?error=access_denied');
    expect(res.status).toBe(302);
    expect(res.headers.location).toContain('error=access_denied');
  });
});

describe('GET /api/auth/fit/callback — user creation idempotency (#5)', () => {
  it('does not create a second Supabase user for a returning FIT identity', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (String(url).includes('check_token')) {
          return Promise.resolve({ ok: true, json: async () => ({ user_name: 'jdoe' }) });
        }
        return Promise.resolve({ ok: true, json: async () => ({ access_token: 'fit-at' }) });
      })
    );
    auth.admin.createUser.mockResolvedValue({ error: null });
    auth.admin.generateLink.mockResolvedValue({
      data: { properties: { hashed_token: 'hash-1' } },
      error: null,
    });
    // First sign-in: user absent. Second: user already present.
    auth.admin.listUsers
      .mockResolvedValueOnce({ data: { users: [] }, error: null })
      .mockResolvedValueOnce({
        data: { users: [{ email: 'jdoe@fit.cvut.cz' }] },
        error: null,
      });

    const callback = () =>
      request(app)
        .get('/api/auth/fit/callback?code=c1&state=s1')
        .set('Cookie', 'fit_oauth_state=s1');

    const first = await callback();
    expect(first.status).toBe(302);
    expect(first.headers.location).toContain('token_hash=hash-1');

    const second = await callback();
    expect(second.status).toBe(302);
    expect(second.headers.location).toContain('token_hash=hash-1');

    // createUser ran for the first sign-in only.
    expect(auth.admin.createUser).toHaveBeenCalledTimes(1);
    expect(auth.admin.createUser.mock.calls[0][0]).toMatchObject({
      email: 'jdoe@fit.cvut.cz',
    });
  });
});

describe('GET /api/questions/:id — narration timing (#audio)', () => {
  beforeEach(() => {
    auth.getUser.mockResolvedValue(VALID);
  });

  it('bundles the narration timing map into the question detail', async () => {
    const res = await request(app)
      .get('/api/questions/NI-SPOL-2')
      .set('Authorization', 'Bearer good-token');
    expect(res.status).toBe(200);
    expect(res.body.audio).toBeTruthy();
    expect(Array.isArray(res.body.audio.sentences)).toBe(true);
    const sentence = res.body.audio.sentences[0];
    expect(typeof sentence.text).toBe('string');
    expect(typeof sentence.start).toBe('number');
    expect(typeof sentence.end).toBe('number');
  });

  // `audio: null` (no timing file) stays handled in handleGetQuestion, but is
  // no longer exercisable here now that every question ships a narration.

  it('404s for an unknown question id', async () => {
    const res = await request(app)
      .get('/api/questions/NOPE-999')
      .set('Authorization', 'Bearer good-token');
    expect(res.status).toBe(404);
  });
});
