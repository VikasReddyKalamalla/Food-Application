import ordersService from './orders.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class OrdersController {
  create = async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'] || null;
    const order = await ordersService.createOrder(req.user.id, req.body, idempotencyKey);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Order created successfully',
      data: { order },
    });
  };

  listMyOrders = async (req, res) => {
    const { orders, meta } = await ordersService.listUserOrders(req.user.id, req.query);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Orders retrieved successfully',
      data: { orders },
      meta,
    });
  };

  getById = async (req, res) => {
    const order = await ordersService.getOrderById(req.params.id, req.user);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Order details retrieved',
      data: { order },
    });
  };

  updateStatus = async (req, res) => {
    const order = await ordersService.updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Order status updated successfully',
      data: { order },
    });
  };

  cancel = async (req, res) => {
    const order = await ordersService.cancelOrder(
      req.params.id,
      req.user,
      req.body.reason
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Order cancelled successfully',
      data: { order },
    });
  };
}

export const ordersController = new OrdersController();
export default ordersController;
