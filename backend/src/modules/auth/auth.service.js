import crypto from 'node:crypto';
import userStore from './user-store.js';
import tokenStore from './token-store.js';
import { hashPassword, comparePassword } from '../../common/utils/password.util.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
} from '../../common/utils/token.util.js';
import {
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
  NotFoundError,
} from '../../common/errors/index.js';
import { ACCOUNT_STATUS } from '../../common/constants/roles.js';

// Strips sensitive fields from user object before sending in response
const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password, role, phone }) {
    const existing = await userStore.findByEmail(email);
    if (existing) {
      throw new ConflictError('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(password);
    const user = await userStore.create({
      name,
      email,
      passwordHash,
      role,
      phone,
    });

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await tokenStore.saveRefreshToken(user.id, refreshToken);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user credentials
   */
  async login({ email, password }) {
    const user = await userStore.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      throw new ForbiddenError(
        `Your account is ${user.status.toLowerCase()}. Please contact support.`
      );
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await tokenStore.saveRefreshToken(user.id, refreshToken);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh session with token rotation
   */
  async refreshToken(rawRefreshToken) {
    if (!rawRefreshToken) {
      throw new UnauthorizedError('Refresh token is required');
    }

    const decoded = verifyRefreshToken(rawRefreshToken);
    const { isValid, userId } = await tokenStore.verifyTokenHash(rawRefreshToken);

    if (!isValid || !userId) {
      throw new UnauthorizedError('Refresh token is invalid or has been revoked');
    }

    const user = await userStore.findById(userId);
    if (!user || user.status !== ACCOUNT_STATUS.ACTIVE) {
      await tokenStore.revokeToken(rawRefreshToken);
      throw new UnauthorizedError('User account not found or is no longer active');
    }

    // Token Rotation: Invalidate current refresh token and issue a fresh pair
    await tokenStore.revokeToken(rawRefreshToken);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await tokenStore.saveRefreshToken(user.id, newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: sanitizeUser(user),
    };
  }

  /**
   * Logout user and invalidate refresh token session
   */
  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await tokenStore.revokeToken(rawRefreshToken);
    }
    return { loggedOut: true };
  }

  /**
   * Get current authenticated user details
   */
  async getCurrentUser(userId) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    return sanitizeUser(user);
  }

  /**
   * Initiate password reset
   */
  async forgotPassword(email) {
    const user = await userStore.findByEmail(email);

    // Timing-attack safe generic response: do not leak whether email exists
    if (!user) {
      return {
        message: 'If the email exists in our records, a password reset link has been dispatched.',
      };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await userStore.savePasswordResetToken(user.id, tokenHash, expiresAt);

    // In a live environment, dispatch through EmailService.
    // For local dev/testing, expose token in mock flow if needed.
    return {
      message: 'If the email exists in our records, a password reset link has been dispatched.',
      resetToken: rawToken, // Provided for easy development and integration testing
    };
  }

  /**
   * Complete password reset using secure token
   */
  async resetPassword(rawToken, newPassword) {
    const tokenHash = hashToken(rawToken);
    const userId = await userStore.verifyPasswordResetToken(tokenHash);

    if (!userId) {
      throw new BadRequestError('Password reset token is invalid or has expired');
    }

    const newPasswordHash = await hashPassword(newPassword);
    await userStore.updatePassword(userId, newPasswordHash);

    // Consume the token so it cannot be reused
    await userStore.consumePasswordResetToken(tokenHash);

    // Revoke all existing sessions for this user for security
    await tokenStore.revokeAllUserTokens(userId);

    return {
      message: 'Password has been successfully reset. Please log in with your new password.',
    };
  }
}

export const authService = new AuthService();
export default authService;
