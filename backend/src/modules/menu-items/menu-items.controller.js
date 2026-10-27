import menuItemsService from './menu-items.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class MenuItemsController {
  listByRestaurant = async (req, res) => {
    const items = await menuItemsService.listByRestaurant(req.params.restaurantId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Menu items retrieved successfully',
      data: { items },
    });
  };

  getById = async (req, res) => {
    const item = await menuItemsService.getById(req.params.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Menu item retrieved successfully',
      data: { item },
    });
  };

  create = async (req, res) => {
    const item = await menuItemsService.createMenuItem(
      req.user.id,
      req.body.restaurantId,
      req.body
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Menu item created successfully',
      data: { item },
    });
  };

  updateAvailability = async (req, res) => {
    const item = await menuItemsService.updateAvailability(
      req.user.id,
      req.params.id,
      req.body.isAvailable
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Menu item availability updated',
      data: { item },
    });
  };
}

export const menuItemsController = new MenuItemsController();
export default menuItemsController;
