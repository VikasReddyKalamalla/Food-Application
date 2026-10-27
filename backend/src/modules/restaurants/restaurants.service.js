import crypto from 'node:crypto';
import { NotFoundError, ForbiddenError } from '../../common/errors/index.js';

/**
 * Restaurant Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Restaurant Schema integration
 */
export class RestaurantsService {
  constructor() {
    this.restaurants = new Map();
  }

  async listRestaurants({ page = 1, limit = 20, search, cuisine }) {
    let all = Array.from(this.restaurants.values());

    if (search) {
      const q = search.toLowerCase();
      all = all.filter((r) => r.name.toLowerCase().includes(q));
    }

    if (cuisine) {
      all = all.filter((r) => r.cuisines?.includes(cuisine));
    }

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paginated = all.slice(startIndex, startIndex + limit);

    return {
      restaurants: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getRestaurantById(id) {
    const restaurant = this.restaurants.get(id);
    if (!restaurant) {
      throw new NotFoundError('Restaurant not found');
    }
    return restaurant;
  }

  async createRestaurant(ownerId, data) {
    const id = crypto.randomUUID();
    const restaurant = {
      id,
      ownerId,
      name: data.name,
      description: data.description || '',
      cuisines: data.cuisines || [],
      address: data.address || {},
      operatingHours: data.operatingHours || { open: '09:00', close: '22:00' },
      isOpen: true,
      rating: 0,
      ratingCount: 0,
      createdAt: new Date(),
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  async updateOperatingHours(ownerId, restaurantId, operatingHours) {
    const restaurant = await this.getRestaurantById(restaurantId);
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('You can only update your own restaurant');
    }
    restaurant.operatingHours = operatingHours;
    return restaurant;
  }
}

export const restaurantsService = new RestaurantsService();
export default restaurantsService;
