import { describe, it, expect } from 'vitest';
import { ROLES, ALL_ROLES } from '../../src/common/constants/roles.js';
import {
  ORDER_STATUS,
  isValidOrderTransition,
} from '../../src/common/constants/order-status.js';
import {
  PAYMENT_STATUS,
  isValidPaymentTransition,
} from '../../src/common/constants/payment-status.js';

describe('Roles & State Machines Verification', () => {
  it('defines all 4 required system roles', () => {
    expect(ALL_ROLES).toContain('CUSTOMER');
    expect(ALL_ROLES).toContain('RESTAURANT_OWNER');
    expect(ALL_ROLES).toContain('DELIVERY_PARTNER');
    expect(ALL_ROLES).toContain('ADMIN');
    expect(ALL_ROLES.length).toBe(4);
  });

  describe('Order State Machine Invariants', () => {
    it('allows valid forward order progression', () => {
      expect(isValidOrderTransition(ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED)).toBe(true);
      expect(isValidOrderTransition(ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING)).toBe(true);
      expect(isValidOrderTransition(ORDER_STATUS.PREPARING, ORDER_STATUS.READY_FOR_PICKUP)).toBe(true);
      expect(isValidOrderTransition(ORDER_STATUS.READY_FOR_PICKUP, ORDER_STATUS.OUT_FOR_DELIVERY)).toBe(true);
      expect(isValidOrderTransition(ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED)).toBe(true);
    });

    it('rejects illegal order state jumps', () => {
      // Cannot skip directly from PENDING to DELIVERED
      expect(isValidOrderTransition(ORDER_STATUS.PENDING, ORDER_STATUS.DELIVERED)).toBe(false);
      // Cannot move backwards from DELIVERED to PREPARING
      expect(isValidOrderTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PREPARING)).toBe(false);
      // Cannot transition from terminal CANCELLED state
      expect(isValidOrderTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.CONFIRMED)).toBe(false);
    });
  });

  describe('Payment State Machine Invariants', () => {
    it('allows valid payment progression and captures', () => {
      expect(isValidPaymentTransition(PAYMENT_STATUS.PENDING, PAYMENT_STATUS.CAPTURED)).toBe(true);
      expect(isValidPaymentTransition(PAYMENT_STATUS.CAPTURED, PAYMENT_STATUS.REFUNDED)).toBe(true);
    });

    it('rejects illegal payment transitions', () => {
      // Cannot refund a failed or pending payment
      expect(isValidPaymentTransition(PAYMENT_STATUS.FAILED, PAYMENT_STATUS.REFUNDED)).toBe(false);
      expect(isValidPaymentTransition(PAYMENT_STATUS.PENDING, PAYMENT_STATUS.REFUNDED)).toBe(false);
      // Cannot transition out of REFUNDED terminal state
      expect(isValidPaymentTransition(PAYMENT_STATUS.REFUNDED, PAYMENT_STATUS.CAPTURED)).toBe(false);
    });
  });
});
