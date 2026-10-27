import { hashToken } from '../../common/utils/token.util.js';

/**
 * Dedicated Refresh Token & Session Store Interface
 *
 * NOTE FOR PHASE 2: This in-memory store acts as the reference boundary for the
 * upcoming Mongoose Session / RefreshToken collection schema.
 * All operations interact exclusively through token hashes (SHA-256).
 */
class TokenStore {
  constructor() {
    // Key: userId -> Array of { tokenHash: string, expiresAt: Date, createdAt: Date, userAgent?: string }
    this.sessions = new Map();
    // Key: tokenHash -> userId
    this.tokenIndex = new Map();
  }

  /**
   * Save a newly issued refresh token hash
   * @param {string} userId
   * @param {string} rawToken
   * @param {number} [expiresInDays=7]
   */
  async saveRefreshToken(userId, rawToken, expiresInDays = 7) {
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push({
      tokenHash,
      expiresAt,
      createdAt: new Date(),
    });

    this.sessions.set(userId, userSessions);
    this.tokenIndex.set(tokenHash, userId);

    return { tokenHash, expiresAt };
  }

  /**
   * Verify whether a refresh token hash exists and is valid
   * @param {string} rawToken
   * @returns {Promise<{ isValid: boolean, userId?: string }>}
   */
  async verifyTokenHash(rawToken) {
    const tokenHash = hashToken(rawToken);
    const userId = this.tokenIndex.get(tokenHash);

    if (!userId) {
      return { isValid: false };
    }

    const userSessions = this.sessions.get(userId) || [];
    const session = userSessions.find((s) => s.tokenHash === tokenHash);

    if (!session || new Date() > session.expiresAt) {
      // Clean up expired session
      await this.revokeToken(rawToken);
      return { isValid: false };
    }

    return { isValid: true, userId };
  }

  /**
   * Revoke a single refresh token (Token Rotation / Single Logout)
   * @param {string} rawToken
   */
  async revokeToken(rawToken) {
    const tokenHash = hashToken(rawToken);
    const userId = this.tokenIndex.get(tokenHash);

    if (!userId) return false;

    this.tokenIndex.delete(tokenHash);
    const userSessions = this.sessions.get(userId) || [];
    const updated = userSessions.filter((s) => s.tokenHash !== tokenHash);
    this.sessions.set(userId, updated);

    return true;
  }

  /**
   * Revoke all sessions for a user (Global Logout / Password Reset)
   * @param {string} userId
   */
  async revokeAllUserTokens(userId) {
    const userSessions = this.sessions.get(userId) || [];
    for (const session of userSessions) {
      this.tokenIndex.delete(session.tokenHash);
    }
    this.sessions.delete(userId);
    return true;
  }

  /**
   * Clear all sessions (Used in test suite resets)
   */
  clear() {
    this.sessions.clear();
    this.tokenIndex.clear();
  }
}

export const tokenStore = new TokenStore();
export default tokenStore;
