import crypto from 'node:crypto';
import restaurantsService from '../restaurants/restaurants.service.js';
import { NotFoundError, ForbiddenError } from '../../common/errors/index.js';

/**
 * Menu Items Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose MenuItem Schema integration
 */
export class MenuItemsService {
  constructor() {
    this.menuItems = new Map();
  }

  async listByRestaurant(restaurantId) {
    const items = [];
    for (const item of this.menuItems.values()) {
      if (item.restaurantId === restaurantId) {
        items.push(item);
      }
    }
    return items;
  }

  async getById(id) {
    const item = this.menuItems.get(id);
    if (!item) {
      throw new NotFoundError('Menu item not found');
    }
    return item;
  }

  async createMenuItem(ownerId, restaurantId, data) {
    const restaurant = await restaurantsService.getRestaurantById(restaurantId);
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('You can only create items for your own restaurant');
    }

    const id = crypto.randomUUID();
    const item = {
      id,
      restaurantId,
      name: data.name,
      description: data.description || '',
      price: data.price,
      categoryId: data.categoryId || null,
      imageUrl: data.imageUrl || null,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      dietary: data.dietary || [], // e.g. ['veg', 'gluten-free']
      createdAt: new Date(),
    };
    this.menuItems.set(id, item);
    return item;
  }

  async updateAvailability(ownerId, menuItemId, isAvailable) {
    const item = await this.getById(menuItemId);
    const restaurant = await restaurantsService.getRestaurantById(item.restaurantId);
    if (restaurant.ownerId !== ownerId) {
      throw new ForbiddenError('You can only modify items for your own restaurant');
    }
    item.isAvailable = Boolean(isAvailable);
    return item;
  }
}

export const menuItemsService = new MenuItemsService();
export default menuItemsService;
