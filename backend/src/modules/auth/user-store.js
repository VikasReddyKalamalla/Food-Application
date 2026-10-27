import crypto from 'node:crypto';
import { ROLES, ACCOUNT_STATUS } from '../../common/constants/roles.js';

/**
 * User Store Interface (Scaffold for Phase 2 Mongoose User Collection)
 * Encapsulates user retrieval and persistence cleanly without scattering DB logic.
 */
class UserStore {
  constructor() {
    this.users = new Map();
    this.resetTokens = new Map(); // tokenHash -> { userId, expiresAt }
  }

  async findByEmail(email) {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async findById(id) {
    return this.users.get(id) || null;
  }

  async create({ name, email, passwordHash, role = ROLES.CUSTOMER, phone }) {
    const id = crypto.randomUUID();
    const user = {
      id,
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      phone: phone || null,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updatePassword(userId, newPasswordHash) {
    const user = this.users.get(userId);
    if (!user) return null;
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date();
    this.users.set(userId, user);
    return user;
  }

  async savePasswordResetToken(userId, tokenHash, expiresAt) {
    this.resetTokens.set(tokenHash, { userId, expiresAt });
  }

  async verifyPasswordResetToken(tokenHash) {
    const record = this.resetTokens.get(tokenHash);
    if (!record) return null;
    if (new Date() > record.expiresAt) {
      this.resetTokens.delete(tokenHash);
      return null;
    }
    return record.userId;
  }

  async consumePasswordResetToken(tokenHash) {
    this.resetTokens.delete(tokenHash);
  }

  clear() {
    this.users.clear();
    this.resetTokens.clear();
  }
}

export const userStore = new UserStore();
export default userStore;
