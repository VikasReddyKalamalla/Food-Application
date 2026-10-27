import ordersService from '../orders/orders.service.js';
import { emitDeliveryLocation, emitOrderUpdate } from '../../infrastructure/realtime/socket.js';
import { ORDER_STATUS } from '../../common/constants/order-status.js';
import { NotFoundError, ForbiddenError } from '../../common/errors/index.js';

/**
 * Delivery Partner & Telemetry Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Delivery Schema integration
 */
export class DeliveryService {
  constructor() {
    this.deliveries = new Map(); // orderId -> delivery record
  }

  async assignPartner(orderId, deliveryPartnerId) {
    const order = ordersService.orders.get(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    order.deliveryPartnerId = deliveryPartnerId;
    order.updatedAt = new Date();

    const record = {
      orderId,
      deliveryPartnerId,
      status: 'ASSIGNED',
      assignedAt: new Date(),
      currentLocation: null,
    };
    this.deliveries.set(orderId, record);

    emitOrderUpdate(orderId, {
      deliveryPartnerId,
      message: 'Delivery partner assigned to your order',
    });

    return record;
  }

  async updatePartnerLocation(orderId, deliveryPartnerId, location) {
    const order = ordersService.orders.get(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenError('You are not assigned to this delivery');
    }

    const record = this.deliveries.get(orderId) || { orderId, deliveryPartnerId };
    record.currentLocation = location;
    record.updatedAt = new Date();
    this.deliveries.set(orderId, record);

    // Emit live telemetry to authorized order room subscribers
    emitDeliveryLocation(orderId, location);

    return record;
  }

  async updateDeliveryStatus(orderId, deliveryPartnerId, status) {
    const order = ordersService.orders.get(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.deliveryPartnerId !== deliveryPartnerId) {
      throw new ForbiddenError('You are not assigned to this delivery');
    }

    if (status === 'PICKED_UP') {
      await ordersService.updateOrderStatus(orderId, ORDER_STATUS.OUT_FOR_DELIVERY, {
        id: deliveryPartnerId,
      });
    } else if (status === 'DELIVERED') {
      await ordersService.updateOrderStatus(orderId, ORDER_STATUS.DELIVERED, {
        id: deliveryPartnerId,
      });
    }

    return { orderId, status };
  }
}

export const deliveryService = new DeliveryService();
export default deliveryService;
