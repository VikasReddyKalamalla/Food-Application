import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../src/common/utils/password.util.js';

describe('Password Utilities', () => {
  const plainPassword = 'SuperSecretPassword123!';

  it('hashes password and never returns plain text', async () => {
    const hash = await hashPassword(plainPassword);
    expect(hash).not.toBe(plainPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);
  });

  it('correctly validates matching password', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await comparePassword(plainPassword, hash);
    expect(isValid).toBe(true);
  });

  it('rejects invalid password', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await comparePassword('WrongPassword123', hash);
    expect(isValid).toBe(false);
  });

  it('throws descriptive error when password is empty or invalid type', async () => {
    await expect(hashPassword('')).rejects.toThrow('Password must be a non-empty string');
    await expect(hashPassword(null)).rejects.toThrow('Password must be a non-empty string');
  });

  it('returns false safely when comparing with null or empty parameters', async () => {
    expect(await comparePassword(null, 'some_hash')).toBe(false);
    expect(await comparePassword('password', null)).toBe(false);
  });
});
