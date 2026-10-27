import crypto from 'node:crypto';
import env from '../../config/env.js';
import { ServiceUnavailableError, BadRequestError } from '../../common/errors/index.js';
import logger from '../../config/logger.js';

/**
 * Payment Gateway Infrastructure Integration (Razorpay)
 */
export class RazorpayClient {
  constructor() {
    this.keyId = env.RAZORPAY_KEY_ID;
    this.keySecret = env.RAZORPAY_KEY_SECRET;
    this.webhookSecret = env.RAZORPAY_WEBHOOK_SECRET;
  }

  isConfigured() {
    return Boolean(this.keyId && this.keySecret);
  }

  assertConfigured() {
    if (!this.isConfigured()) {
      throw new ServiceUnavailableError(
        'Payment gateway is not currently configured. Please contact administrator.'
      );
    }
  }

  /**
   * Verifies the authenticity of a Razorpay webhook signature
   * @param {string|Buffer} rawPayload - Raw request body
   * @param {string} signature - Header 'x-razorpay-signature'
   * @returns {boolean}
   */
  verifyWebhookSignature(rawPayload, signature) {
    if (!this.webhookSecret) {
      throw new ServiceUnavailableError('Webhook secret is not configured');
    }

    if (!signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawPayload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  }

  /**
   * Creates an order with Razorpay
   * Invariant: Server calculates and dictates amount in smallest currency unit (paise)
   */
  async createPaymentOrder({ amountInPaise, currency = 'INR', receipt }) {
    this.assertConfigured();

    logger.info({ amountInPaise, currency, receipt }, 'Initiating payment order with provider');

    // In live integration, this calls the Razorpay SDK
    return {
      id: `order_rzp_${Date.now()}`,
      amount: amountInPaise,
      currency,
      receipt,
      status: 'created',
    };
  }
}

export const razorpayClient = new RazorpayClient();
export default razorpayClient;
