import notificationsService from './notifications.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class NotificationsController {
  list = async (req, res) => {
    const notifications = await notificationsService.getUserNotifications(req.user.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Notifications retrieved',
      data: { notifications },
    });
  };
}

export const notificationsController = new NotificationsController();
export default notificationsController;
