import userStore from '../auth/user-store.js';
import { NotFoundError } from '../../common/errors/index.js';

/**
 * User Account Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose User Schema integration
 */
export class UsersService {
  async getProfile(userId) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId, updateData) {
    const user = await userStore.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    if (updateData.name) user.name = updateData.name;
    if (updateData.phone) user.phone = updateData.phone;
    user.updatedAt = new Date();

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}

export const usersService = new UsersService();
export default usersService;
