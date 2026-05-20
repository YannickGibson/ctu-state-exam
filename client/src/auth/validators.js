const USERNAME_RE = /^[a-z][a-z0-9_]{2,31}$/;

export function validateUsername(value) {
  if (typeof value !== 'string' || !USERNAME_RE.test(value)) {
    return 'Username must be 3-32 chars, start with a letter, and contain only lowercase letters, digits, or underscores.';
  }
  return null;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 8 || !/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must be at least 8 characters and include a letter and a digit.';
  }
  return null;
}
