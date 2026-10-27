import usersService from './users.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class UsersController {
  getProfile = async (req, res) => {
    const profile = await usersService.getProfile(req.user.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User profile retrieved successfully',
      data: { profile },
    });
  };

  updateProfile = async (req, res) => {
    const profile = await usersService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Profile updated successfully',
      data: { profile },
    });
  };
}

export const usersController = new UsersController();
export default usersController;
