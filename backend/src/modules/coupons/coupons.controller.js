import couponsService from './coupons.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class CouponsController {
  list = async (req, res) => {
    const coupons = await couponsService.listActiveCoupons();
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Active coupons retrieved',
      data: { coupons },
    });
  };

  validate = async (req, res) => {
    const coupon = await couponsService.validateCoupon(req.body.code, req.body.subtotal || 0);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Coupon is valid',
      data: { coupon },
    });
  };

  create = async (req, res) => {
    const coupon = await couponsService.createCoupon(req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  };
}

export const couponsController = new CouponsController();
export default couponsController;
