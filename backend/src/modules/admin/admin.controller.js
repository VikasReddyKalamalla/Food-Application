import adminService from './admin.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class AdminController {
  listUsers = async (req, res) => {
    const users = await adminService.listAllUsers();
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'All users retrieved',
      data: { users },
    });
  };

  updateUserStatus = async (req, res) => {
    const user = await adminService.updateUserStatus(req.params.id, req.body.status);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'User status updated',
      data: { user },
    });
  };

  getSystemStats = async (req, res) => {
    const stats = await adminService.getSystemStats();
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'System stats retrieved',
      data: { stats },
    });
  };
}

export const adminController = new AdminController();
export default adminController;
