import menuItemsService from '../menu-items/menu-items.service.js';
import { calculateOrderTotals } from '../orders/order.invariants.js';
import { BadRequestError } from '../../common/errors/index.js';

/**
 * Carts Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Cart Schema integration
 */
export class CartsService {
  constructor() {
    this.carts = new Map(); // userId -> { restaurantId, items: Array<{ menuItemId, name, price, quantity }> }
  }

  async getCart(userId) {
    const cart = this.carts.get(userId) || {
      restaurantId: null,
      items: [],
      totals: { subtotal: 0, tax: 0, deliveryFee: 0, discount: 0, grandTotal: 0 },
    };

    if (cart.items.length > 0) {
      cart.totals = calculateOrderTotals(cart.items);
    }

    return cart;
  }

  async addItem(userId, { menuItemId, quantity = 1, restaurantId }) {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than zero');
    }

    const menuItem = await menuItemsService.getById(menuItemId);
    if (!menuItem.isAvailable) {
      throw new BadRequestError(`'${menuItem.name}' is currently unavailable`);
    }

    let cart = this.carts.get(userId);

    // Invariant: Cart can only contain items from ONE restaurant at a time
    if (cart && cart.restaurantId && cart.restaurantId !== menuItem.restaurantId) {
      throw new BadRequestError(
        'Your cart contains items from another restaurant. Please clear your cart first.'
      );
    }

    if (!cart) {
      cart = { restaurantId: menuItem.restaurantId, items: [] };
    }

    const existingIndex = cart.items.findIndex((i) => i.menuItemId === menuItemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      // Invariant: Server always refreshes current authoritative item price
      cart.items[existingIndex].price = menuItem.price;
    } else {
      cart.restaurantId = menuItem.restaurantId;
      cart.items.push({
        menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });
    }

    this.carts.set(userId, cart);
    cart.totals = calculateOrderTotals(cart.items);
    return cart;
  }

  async removeItem(userId, menuItemId) {
    const cart = this.carts.get(userId);
    if (!cart) return { items: [], totals: { grandTotal: 0 } };

    cart.items = cart.items.filter((i) => i.menuItemId !== menuItemId);
    if (cart.items.length === 0) {
      cart.restaurantId = null;
    }

    this.carts.set(userId, cart);
    cart.totals = cart.items.length > 0 ? calculateOrderTotals(cart.items) : { grandTotal: 0 };
    return cart;
  }

  async clearCart(userId) {
    this.carts.delete(userId);
    return { cleared: true };
  }
}

export const cartsService = new CartsService();
export default cartsService;
