import crypto from 'node:crypto';
import cartsService from '../carts/carts.service.js';
import couponsService from '../coupons/coupons.service.js';
import menuItemsService from '../menu-items/menu-items.service.js';
import { calculateOrderTotals } from './order.invariants.js';
import {
  ORDER_STATUS,
  isValidOrderTransition,
} from '../../common/constants/order-status.js';
import { PAYMENT_STATUS } from '../../common/constants/payment-status.js';
import { ROLES } from '../../common/constants/roles.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} from '../../common/errors/index.js';
import { emitOrderUpdate } from '../../infrastructure/realtime/socket.js';

/**
 * Orders Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Order Schema and MongoDB Multi-Document Transactions
 */
export class OrdersService {
  constructor() {
    this.orders = new Map(); // orderId -> order
    this.idempotencyMap = new Map(); // idempotencyKey -> orderId
  }

  /**
   * Place an order with server-calculated totals and idempotency guard
   */
  async createOrder(customerId, { deliveryAddress, couponCode }, idempotencyKey = null) {
    if (idempotencyKey && this.idempotencyMap.has(idempotencyKey)) {
      const existingOrderId = this.idempotencyMap.get(idempotencyKey);
      return this.orders.get(existingOrderId);
    }

    const cart = await cartsService.getCart(customerId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestError('Cannot place an order with an empty cart');
    }

    if (!cart.restaurantId) {
      throw new BadRequestError('Cart is missing restaurant association');
    }

    // Invariant: Verify current item availability and authoritative prices from database
    const validatedItems = [];
    for (const item of cart.items) {
      const currentItem = await menuItemsService.getById(item.menuItemId);
      if (!currentItem.isAvailable) {
        throw new BadRequestError(
          `Item '${currentItem.name}' is no longer available. Please update your cart.`
        );
      }
      validatedItems.push({
        menuItemId: currentItem.id,
        name: currentItem.name,
        price: currentItem.price, // Server authoritative
        quantity: item.quantity,
      });
    }

    // Invariant: Authoritative Coupon Validation
    let coupon = null;
    if (couponCode) {
      const roughSubtotal = validatedItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
      coupon = await couponsService.validateCoupon(couponCode, roughSubtotal);
    }

    // Invariant: Server-calculated totals
    const calculatedTotals = calculateOrderTotals(validatedItems, coupon);

    const orderId = crypto.randomUUID();
    const order = {
      id: orderId,
      customerId,
      restaurantId: cart.restaurantId,
      deliveryPartnerId: null,
      items: validatedItems,
      deliveryAddress,
      pricing: calculatedTotals,
      orderStatus: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      idempotencyKey,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.orders.set(orderId, order);
    if (idempotencyKey) {
      this.idempotencyMap.set(idempotencyKey, orderId);
    }

    // Clear cart after successful order creation
    await cartsService.clearCart(customerId);

    // Emit real-time notification
    emitOrderUpdate(orderId, {
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      message: 'New order created',
    });

    return order;
  }

  async getOrderById(orderId, currentUser) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Authorization guard: Customer, Restaurant Owner, Delivery Partner, or Admin
    const isAuthorized =
      order.customerId === currentUser.id ||
      order.deliveryPartnerId === currentUser.id ||
      currentUser.role === ROLES.ADMIN ||
      currentUser.role === ROLES.RESTAURANT_OWNER;

    if (!isAuthorized) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return order;
  }

  async listUserOrders(userId, { page = 1, limit = 20 }) {
    const userOrders = [];
    for (const order of this.orders.values()) {
      if (order.customerId === userId) {
        userOrders.push(order);
      }
    }

    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = userOrders.length;
    const startIndex = (page - 1) * limit;
    const paginated = userOrders.slice(startIndex, startIndex + limit);

    return {
      orders: paginated,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Update order status enforcing finite state transitions
   */
  async updateOrderStatus(orderId, targetStatus, currentUser) {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Invariant: Strict State Machine Transition Check
    if (!isValidOrderTransition(order.orderStatus, targetStatus)) {
      throw new ConflictError(
        `Invalid order status transition from '${order.orderStatus}' to '${targetStatus}'`
      );
    }

    order.orderStatus = targetStatus;
    order.updatedAt = new Date();

    emitOrderUpdate(orderId, {
      status: targetStatus,
      message: `Order status transitioned to ${targetStatus}`,
    });

    return order;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId, currentUser, reason) {
    const order = await this.getOrderById(orderId, currentUser);

    if (
      order.orderStatus === ORDER_STATUS.DELIVERED ||
      order.orderStatus === ORDER_STATUS.CANCELLED
    ) {
      throw new ConflictError(`Cannot cancel an order in state '${order.orderStatus}'`);
    }

    return this.updateOrderStatus(orderId, ORDER_STATUS.CANCELLED, currentUser);
  }
}

export const ordersService = new OrdersService();
export default ordersService;
