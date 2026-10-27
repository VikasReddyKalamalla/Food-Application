import cartsService from './carts.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class CartsController {
  getCart = async (req, res) => {
    const cart = await cartsService.getCart(req.user.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Cart retrieved successfully',
      data: { cart },
    });
  };

  addItem = async (req, res) => {
    const cart = await cartsService.addItem(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Item added to cart',
      data: { cart },
    });
  };

  removeItem = async (req, res) => {
    const cart = await cartsService.removeItem(req.user.id, req.params.menuItemId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Item removed from cart',
      data: { cart },
    });
  };

  clearCart = async (req, res) => {
    await cartsService.clearCart(req.user.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Cart cleared successfully',
      data: { cleared: true },
    });
  };
}

export const cartsController = new CartsController();
export default cartsController;
