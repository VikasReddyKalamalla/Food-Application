import reviewsService from './reviews.service.js';
import { sendSuccess } from '../../common/utils/response.util.js';
import { HTTP_STATUS } from '../../common/constants/http-status.js';

export class ReviewsController {
  create = async (req, res) => {
    const review = await reviewsService.createReview(req.user.id, req.body);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.CREATED,
      message: 'Review submitted successfully',
      data: { review },
    });
  };

  listForRestaurant = async (req, res) => {
    const reviews = await reviewsService.listRestaurantReviews(req.params.restaurantId);
    return sendSuccess(res, {
      statusCode: HTTP_STATUS.OK,
      message: 'Reviews retrieved successfully',
      data: { reviews },
    });
  };
}

export const reviewsController = new ReviewsController();
export default reviewsController;
