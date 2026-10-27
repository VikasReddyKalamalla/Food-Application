import deliveryService from './delivery.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class DeliveryController {
  assign = async (req, res) => {
    const record = await deliveryService.assignPartner(req.params.orderId, req.body.partnerId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Delivery partner assigned',
      data: { delivery: record },
    });
  };

  updateLocation = async (req, res) => {
    const record = await deliveryService.updatePartnerLocation(
      req.params.orderId,
      req.user.id,
      req.body.location
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Location updated',
      data: { delivery: record },
    });
  };

  updateStatus = async (req, res) => {
    const result = await deliveryService.updateDeliveryStatus(
      req.params.orderId,
      req.user.id,
      req.body.status
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Delivery status updated',
      data: result,
    });
  };
}

export const deliveryController = new DeliveryController();
export default deliveryController;
