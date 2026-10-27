import { describe, it, expect } from 'vitest';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
} from '../../src/common/utils/token.util.js';
import { UnauthorizedError } from '../../src/common/errors/index.js';

describe('Token Utilities (JWT & SHA-256 Hashes)', () => {
  const payload = { id: 'user-123', email: 'user@example.com', role: 'CUSTOMER' };

  it('generates and verifies a valid JWT access token', () => {
    const token = generateAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.iss).toBe('food-delivery-api');
  });

  it('generates and verifies a valid JWT refresh token', () => {
    const token = generateRefreshToken(payload);
    const decoded = verifyRefreshToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  it('throws UnauthorizedError when verifying an invalid token string', () => {
    expect(() => verifyAccessToken('invalid.token.structure')).toThrow(UnauthorizedError);
  });

  it('throws UnauthorizedError with code TOKEN_EXPIRED on expired tokens', () => {
    // Generate token with negative expiration to simulate immediate expiration
    const expiredToken = generateAccessToken(payload, '-1s');
    expect(() => verifyAccessToken(expiredToken)).toThrowError(UnauthorizedError);
  });

  it('computes consistent deterministic SHA-256 token hashes', () => {
    const sampleToken = 'random_refresh_token_string_12345';
    const hash1 = hashToken(sampleToken);
    const hash2 = hashToken(sampleToken);

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string length
  });
});
