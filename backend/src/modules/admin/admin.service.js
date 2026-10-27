import userStore from '../auth/user-store.js';
import { getDatabaseHealth } from '../../config/database.js';
import { NotFoundError } from '../../common/errors/index.js';

/**
 * Admin Governance Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Platform Audits & Moderation Schemas
 */
export class AdminService {
  async listAllUsers() {
    const users = Array.from(userStore.users.values()).map((u) => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    return users;
  }

  async updateUserStatus(userId, status) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    user.status = status;
    user.updatedAt = new Date();
    const { passwordHash, ...safe } = user;
    return safe;
  }

  async getSystemStats() {
    return {
      database: getDatabaseHealth(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
    };
  }
}

export const adminService = new AdminService();
export default adminService;
