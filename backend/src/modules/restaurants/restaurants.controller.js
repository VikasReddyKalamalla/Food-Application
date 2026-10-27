import restaurantsService from './restaurants.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class RestaurantsController {
  list = async (req, res) => {
    const { restaurants, meta } = await restaurantsService.listRestaurants(req.query);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Restaurants retrieved successfully',
      data: { restaurants },
      meta,
    });
  };

  getById = async (req, res) => {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Restaurant retrieved successfully',
      data: { restaurant },
    });
  };

  create = async (req, res) => {
    const restaurant = await restaurantsService.createRestaurant(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Restaurant created successfully',
      data: { restaurant },
    });
  };

  updateOperatingHours = async (req, res) => {
    const restaurant = await restaurantsService.updateOperatingHours(
      req.user.id,
      req.params.id,
      req.body.operatingHours
    );
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Operating hours updated successfully',
      data: { restaurant },
    });
  };
}

export const restaurantsController = new RestaurantsController();
export default restaurantsController;
