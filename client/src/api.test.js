import { describe, it, expect, beforeEach, vi } from 'vitest';

// Stateful stub for the Supabase client. Tests set `state.rpc` /
// `state.maybeSingle` to control what reads return, and inspect the mocked
// `supabase.rpc` / `supabase.from` to see what would be written.
const state = vi.hoisted(() => ({
  user: { id: 'user-1' },
  userError: null,
  maybeSingle: { data: null, error: null }, // getProgressFor() read
  select: { data: [], error: null }, // chained .select().eq() read
  upsert: { error: null },
  upsertCalls: [],
  rpc: { data: [], error: null }, // bump_practiced result
}));

vi.mock('./supabaseClient.js', () => {
  function query() {
    const q = {
      select: () => q,
      eq: () => q,
      in: () => q,
      gt: () => q,
      maybeSingle: () => Promise.resolve(state.maybeSingle),
      upsert: (rows, opts) => {
        state.upsertCalls.push({ rows, opts });
        return Promise.resolve(state.upsert);
      },
      then: (resolve, reject) => Promise.resolve(state.select).then(resolve, reject),
    };
    return q;
  }
  return {
    supabase: {
      auth: {
        getUser: () =>
          Promise.resolve({ data: { user: state.user }, error: state.userError }),
      },
      from: vi.fn(() => query()),
      rpc: vi.fn(() => Promise.resolve(state.rpc)),
    },
  };
});

import { patchProgress, completeQuiz } from './api.js';
import { supabase } from './supabaseClient.js';

beforeEach(() => {
  state.user = { id: 'user-1' };
  state.userError = null;
  state.maybeSingle = { data: null, error: null };
  state.select = { data: [], error: null };
  state.upsert = { error: null };
  state.upsertCalls = [];
  state.rpc = { data: [], error: null };
  supabase.from.mockClear();
  supabase.rpc.mockClear();
});

describe('patchProgress — "practice" (#6)', () => {
  it('increments via the atomic bump_practiced RPC and returns the new count', async () => {
    state.rpc = {
      data: [{ practiced_count: 3, read_passively: false }],
      error: null,
    };
    const result = await patchProgress('NI-SPOL-1', 'practice');

    expect(result).toEqual({
      id: 'NI-SPOL-1',
      progress: { practicedCount: 3, readPassively: false },
    });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(supabase.rpc).toHaveBeenCalledWith('bump_practiced', {
      p_question_ids: ['NI-SPOL-1'],
    });
  });

  it('does no read-modify-write — the old lost-update race is gone (#9)', async () => {
    // A single atomic RPC, no SELECT-then-UPSERT: two concurrent practices
    // are now serialized by the database instead of both writing base+1.
    state.rpc = { data: [{ practiced_count: 1, read_passively: false }], error: null };
    await patchProgress('NI-SPOL-1', 'practice');
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('surfaces the server-side cap — practicedCount never exceeds the limit', async () => {
    // The RPC caps at 3; the client trusts whatever the RPC returns.
    state.rpc = { data: [{ practiced_count: 3, read_passively: false }], error: null };
    const result = await patchProgress('NI-SPOL-1', 'practice');
    expect(result.progress.practicedCount).toBe(3);
  });

  it('propagates an RPC error', async () => {
    state.rpc = { data: null, error: new Error('rpc failed') };
    await expect(patchProgress('NI-SPOL-1', 'practice')).rejects.toThrow('rpc failed');
  });
});

describe('patchProgress — "readPassively" (#7)', () => {
  it('sets the flag when the question has not been practiced', async () => {
    state.maybeSingle = { data: null, error: null };
    const result = await patchProgress('NI-SPOL-1', 'readPassively');

    expect(result.progress).toEqual({ practicedCount: 0, readPassively: true });
    expect(state.upsertCalls[0].rows.read_passively).toBe(true);
  });

  it('refuses to set the flag once practicedCount > 0', async () => {
    state.maybeSingle = {
      data: { practiced_count: 1, read_passively: false },
      error: null,
    };
    const result = await patchProgress('NI-SPOL-1', 'readPassively');

    expect(result.progress).toEqual({ practicedCount: 1, readPassively: false });
    expect(state.upsertCalls[0].rows.read_passively).toBe(false);
  });
});

describe('patchProgress — "reset" (#8)', () => {
  it('zeroes both fields regardless of current state', async () => {
    state.maybeSingle = {
      data: { practiced_count: 3, read_passively: false },
      error: null,
    };
    const result = await patchProgress('NI-SPOL-1', 'reset');

    expect(result.progress).toEqual({ practicedCount: 0, readPassively: false });
    expect(state.upsertCalls[0].rows).toMatchObject({
      practiced_count: 0,
      read_passively: false,
    });
  });

  it('throws on an unknown action', async () => {
    await expect(patchProgress('NI-SPOL-1', 'bogus')).rejects.toThrow('unknown action');
  });
});

describe('completeQuiz (#12)', () => {
  it('bumps every given question through the atomic RPC in one call', async () => {
    const result = await completeQuiz('NI-ZI', ['NI-ZI-1', 'NI-ZI-2']);

    expect(result).toEqual({ subject: 'NI-ZI', updated: ['NI-ZI-1', 'NI-ZI-2'] });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(supabase.rpc).toHaveBeenCalledWith('bump_practiced', {
      p_question_ids: ['NI-ZI-1', 'NI-ZI-2'],
    });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('propagates a database error from the RPC', async () => {
    state.rpc = { data: null, error: new Error('db unavailable') };
    await expect(completeQuiz('NI-ZI', ['NI-ZI-1'])).rejects.toThrow('db unavailable');
  });
});
