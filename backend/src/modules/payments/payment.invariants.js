import { isValidPaymentTransition, PAYMENT_STATUS } from '../../common/constants/payment-status.js';
import { BadRequestError, ConflictError } from '../../common/errors/index.js';

// In-memory processed webhook events store for deduplication
const processedWebhookEvents = new Set();

/**
 * Ensures payment state machine transition is legitimate
 * @param {string} currentStatus
 * @param {string} newStatus
 */
export const assertValidPaymentTransition = (currentStatus, newStatus) => {
  if (!isValidPaymentTransition(currentStatus, newStatus)) {
    throw new ConflictError(
      `Illegal payment status transition: Cannot move from '${currentStatus}' to '${newStatus}'`
    );
  }
};

/**
 * Checks and records webhook event to ensure idempotency.
 * Prevents double-capturing or double-refunding orders.
 * @param {string} eventId
 */
export const assertWebhookIdempotency = (eventId) => {
  if (!eventId) {
    throw new BadRequestError('Missing webhook event identifier');
  }

  if (processedWebhookEvents.has(eventId)) {
    return { isDuplicate: true };
  }

  processedWebhookEvents.add(eventId);
  return { isDuplicate: false };
};

/**
 * Validates refund eligibility and amount
 * @param {{ amount: number, status: string }} payment
 * @param {number} refundAmount
 */
export const validateRefundEligibility = (payment, refundAmount) => {
  if (payment.status !== PAYMENT_STATUS.CAPTURED) {
    throw new BadRequestError(`Cannot refund payment in '${payment.status}' state`);
  }

  if (refundAmount <= 0) {
    throw new BadRequestError('Refund amount must be greater than zero');
  }

  if (refundAmount > payment.amount) {
    throw new BadRequestError('Refund amount cannot exceed the original paid amount');
  }

  return true;
};

export default {
  assertValidPaymentTransition,
  assertWebhookIdempotency,
  validateRefundEligibility,
};
