import crypto from 'node:crypto';
import restaurantsService from '../restaurants/restaurants.service.js';
import { BadRequestError } from '../../common/errors/index.js';

/**
 * Reviews Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Review Schema integration
 */
export class ReviewsService {
  constructor() {
    this.reviews = new Map();
  }

  async createReview(customerId, { restaurantId, orderId, rating, comment }) {
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be an integer between 1 and 5');
    }

    const restaurant = await restaurantsService.getRestaurantById(restaurantId);

    const id = crypto.randomUUID();
    const review = {
      id,
      customerId,
      restaurantId,
      orderId: orderId || null,
      rating,
      comment: comment || '',
      createdAt: new Date(),
    };

    this.reviews.set(id, review);

    // Update aggregate restaurant rating
    const existingCount = restaurant.ratingCount || 0;
    const currentRating = restaurant.rating || 0;
    const newRating = Math.round(((currentRating * existingCount + rating) / (existingCount + 1)) * 10) / 10;

    restaurant.rating = newRating;
    restaurant.ratingCount = existingCount + 1;

    return review;
  }

  async listRestaurantReviews(restaurantId) {
    const list = [];
    for (const rev of this.reviews.values()) {
      if (rev.restaurantId === restaurantId) {
        list.push(rev);
      }
    }
    return list;
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
