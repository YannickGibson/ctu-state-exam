import { describe, it, expect } from 'vitest';
import { COMMITTEE_ALLOW, isCommitteeUser } from './committee.js';

describe('isCommitteeUser', () => {
  it('admits the two allowlisted usernames', () => {
    expect(isCommitteeUser('gibsoyan')).toBe(true);
    expect(isCommitteeUser('kvasvojt')).toBe(true);
  });

  it('rejects anyone else', () => {
    expect(isCommitteeUser('someoneelse')).toBe(false);
  });

  it('handles missing/empty username without throwing', () => {
    expect(isCommitteeUser(undefined)).toBe(false);
    expect(isCommitteeUser(null)).toBe(false);
    expect(isCommitteeUser('')).toBe(false);
  });

  it('exposes exactly the two expected usernames', () => {
    expect(COMMITTEE_ALLOW).toEqual(['gibsoyan', 'kvasvojt']);
  });
});
