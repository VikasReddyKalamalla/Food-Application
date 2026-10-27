import logger from '../config/logger.js';
import tokenStore from '../modules/auth/token-store.js';

/**
 * Maintenance job to prune expired refresh tokens from session store
 */
export const runCleanupJob = async () => {
  try {
    const now = new Date();
    let prunedCount = 0;

    for (const [userId, sessions] of tokenStore.sessions.entries()) {
      const activeSessions = sessions.filter((s) => s.expiresAt > now);
      const expired = sessions.length - activeSessions.length;
      if (expired > 0) {
        prunedCount += expired;
        tokenStore.sessions.set(userId, activeSessions);
      }
    }

    if (prunedCount > 0) {
      logger.info({ prunedCount }, 'Cleanup job pruned expired sessions');
    }
    return { prunedCount };
  } catch (error) {
    logger.error({ err: error.message }, 'Cleanup job encountered an error');
    return { error: error.message };
  }
};

export default runCleanupJob;
