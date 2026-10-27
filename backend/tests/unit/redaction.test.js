import { describe, it, expect } from 'vitest';
import { REDACTED_PATHS } from '../../src/config/logger.js';

describe('Sensitive Field Redaction Configuration', () => {
  it('includes all critical credential paths in logger redaction configuration', () => {
    expect(REDACTED_PATHS).toContain('req.headers.authorization');
    expect(REDACTED_PATHS).toContain('req.headers.cookie');
    expect(REDACTED_PATHS).toContain('body.password');
    expect(REDACTED_PATHS).toContain('body.refreshToken');
    expect(REDACTED_PATHS).toContain('body.cardNumber');
    expect(REDACTED_PATHS).toContain('body.cvv');
  });
});
