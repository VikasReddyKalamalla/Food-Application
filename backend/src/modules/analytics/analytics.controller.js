import analyticsService from './analytics.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class AnalyticsController {
  getRestaurantMetrics = async (req, res) => {
    const metrics = await analyticsService.getRestaurantMetrics(req.params.restaurantId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Restaurant analytics retrieved',
      data: { metrics },
    });
  };

  getPlatformMetrics = async (req, res) => {
    const metrics = await analyticsService.getPlatformMetrics();
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Platform analytics retrieved',
      data: { metrics },
    });
  };
}

export const analyticsController = new AnalyticsController();
export default analyticsController;
