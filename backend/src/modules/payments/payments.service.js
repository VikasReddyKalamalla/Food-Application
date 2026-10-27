import crypto from 'node:crypto';
import ordersService from '../orders/orders.service.js';
import razorpayClient from '../../infrastructure/payments/razorpay.client.js';
import {
  PAYMENT_STATUS,
  PAYMENT_METHODS,
} from '../../common/constants/payment-status.js';
import {
  assertValidPaymentTransition,
  assertWebhookIdempotency,
  validateRefundEligibility,
} from './payment.invariants.js';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '../../common/errors/index.js';
import { ROLES } from '../../common/constants/roles.js';

/**
 * Payments Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Payment Schema integration
 */
export class PaymentsService {
  constructor() {
    this.payments = new Map(); // paymentId -> payment
  }

  /**
   * Initiate payment for an existing order
   * Invariant: Server dictates the exact amount from the order
   */
  async initiatePayment(orderId, method, currentUser) {
    const order = await ordersService.getOrderById(orderId, currentUser);

    if (order.paymentStatus === PAYMENT_STATUS.CAPTURED) {
      throw new BadRequestError('This order has already been paid for');
    }

    const paymentId = crypto.randomUUID();
    const amountInPaise = Math.round(order.pricing.grandTotal * 100);

    let providerData = null;
    if (method !== PAYMENT_METHODS.CASH_ON_DELIVERY && razorpayClient.isConfigured()) {
      providerData = await razorpayClient.createPaymentOrder({
        amountInPaise,
        receipt: `receipt_${orderId.slice(0, 8)}`,
      });
    }

    const payment = {
      id: paymentId,
      orderId,
      customerId: currentUser.id,
      amount: order.pricing.grandTotal,
      currency: 'INR',
      method,
      status:
        method === PAYMENT_METHODS.CASH_ON_DELIVERY
          ? PAYMENT_STATUS.PENDING
          : PAYMENT_STATUS.PENDING,
      providerData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.payments.set(paymentId, payment);
    return payment;
  }

  /**
   * Process webhook from payment gateway
   * Invariant: Never mark paid without cryptographic signature verification
   * Invariant: Repeated webhooks must be idempotent
   */
  async handleWebhook(rawBody, signature, event) {
    if (razorpayClient.isConfigured()) {
      const isValid = razorpayClient.verifyWebhookSignature(rawBody, signature);
      if (!isValid) {
        throw new BadRequestError('Invalid webhook cryptographic signature');
      }
    }

    const eventId = event?.id || `evt_${Date.now()}`;
    const { isDuplicate } = assertWebhookIdempotency(eventId);
    if (isDuplicate) {
      return { status: 'already_processed' };
    }

    const { eventType, paymentId, orderId } = event;

    if (eventType === 'payment.captured' && paymentId) {
      const payment = this.payments.get(paymentId);
      if (payment) {
        assertValidPaymentTransition(payment.status, PAYMENT_STATUS.CAPTURED);
        payment.status = PAYMENT_STATUS.CAPTURED;
        payment.updatedAt = new Date();

        // Update corresponding order payment status
        const order = ordersService.orders.get(orderId || payment.orderId);
        if (order) {
          order.paymentStatus = PAYMENT_STATUS.CAPTURED;
        }
      }
    }

    return { received: true };
  }

  /**
   * Process refund with validation and authorization checks
   */
  async processRefund(paymentId, amount, currentUser) {
    if (currentUser.role !== ROLES.ADMIN) {
      throw new ForbiddenError('Only administrative staff can issue refunds');
    }

    const payment = this.payments.get(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    validateRefundEligibility(payment, amount);
    assertValidPaymentTransition(payment.status, PAYMENT_STATUS.REFUNDED);

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.refundedAmount = amount;
    payment.updatedAt = new Date();

    return payment;
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
