import { describe, it, expect } from 'vitest';
import { calculateOrderTotals } from '../../src/modules/orders/order.invariants.js';

describe('Order Monetary Invariants & Price Calculation Engine', () => {
  it('correctly calculates subtotal, 5% tax, and standard delivery fee for small order', () => {
    const items = [
      { price: 100, quantity: 2 }, // 200
      { price: 50, quantity: 1 },  // 50
    ]; // subtotal = 250

    const result = calculateOrderTotals(items);

    expect(result.subtotal).toBe(250);
    expect(result.discount).toBe(0);
    expect(result.taxableAmount).toBe(250);
    expect(result.tax).toBe(12.5); // 5% of 250
    expect(result.deliveryFee).toBe(40); // under 500 threshold
    expect(result.grandTotal).toBe(302.5); // 250 + 12.5 + 40
  });

  it('applies free delivery for orders at or above 500 threshold', () => {
    const items = [{ price: 300, quantity: 2 }]; // 600

    const result = calculateOrderTotals(items);

    expect(result.subtotal).toBe(600);
    expect(result.deliveryFee).toBe(0);
    expect(result.tax).toBe(30); // 5% of 600
    expect(result.grandTotal).toBe(630);
  });

  it('correctly applies percentage coupon with max discount cap', () => {
    const items = [{ price: 500, quantity: 2 }]; // 1000
    const coupon = { discountPercentage: 20, maxDiscount: 100 }; // 20% of 1000 is 200, capped at 100

    const result = calculateOrderTotals(items, coupon);

    expect(result.subtotal).toBe(1000);
    expect(result.discount).toBe(100);
    expect(result.taxableAmount).toBe(900);
    expect(result.tax).toBe(45); // 5% of 900
    expect(result.deliveryFee).toBe(0);
    expect(result.grandTotal).toBe(945);
  });

  it('throws BadRequestError when items array is empty', () => {
    expect(() => calculateOrderTotals([])).toThrow(/empty order/);
  });

  it('throws BadRequestError if any item has negative price or non-positive quantity', () => {
    expect(() => calculateOrderTotals([{ price: -10, quantity: 1 }])).toThrow();
    expect(() => calculateOrderTotals([{ price: 100, quantity: 0 }])).toThrow();
  });
});
