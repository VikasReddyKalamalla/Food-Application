import { BadRequestError } from '../../common/errors/index.js';

export const TAX_RATE_PERCENTAGE = 5; // 5% GST/VAT
export const DEFAULT_DELIVERY_FEE = 40; // 40 INR / standard base
export const FREE_DELIVERY_THRESHOLD = 500;

/**
 * Server-authoritative price calculation engine.
 * The client NEVER dictates items subtotal, tax, delivery fee, discount, or grand total.
 *
 * @param {Array<{ price: number, quantity: number, name?: string }>} items
 * @param {{ discountPercentage?: number, maxDiscount?: number, flatDiscount?: number }} [coupon]
 * @param {number} [deliveryFee=DEFAULT_DELIVERY_FEE]
 */
export const calculateOrderTotals = (items, coupon = null, deliveryFee = DEFAULT_DELIVERY_FEE) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new BadRequestError('Cannot calculate totals for an empty order');
  }

  // 1. Calculate item subtotal
  const subtotal = items.reduce((sum, item) => {
    if (item.price < 0 || item.quantity <= 0) {
      throw new BadRequestError('Invalid item price or quantity in order items');
    }
    return sum + Math.round(item.price * item.quantity * 100) / 100;
  }, 0);

  // 2. Calculate discounts
  let discount = 0;
  if (coupon) {
    if (coupon.discountPercentage) {
      const computed = (subtotal * coupon.discountPercentage) / 100;
      discount = coupon.maxDiscount ? Math.min(computed, coupon.maxDiscount) : computed;
    } else if (coupon.flatDiscount) {
      discount = Math.min(coupon.flatDiscount, subtotal);
    }
    discount = Math.round(discount * 100) / 100;
  }

  const taxableAmount = Math.max(0, subtotal - discount);

  // 3. Calculate taxes
  const tax = Math.round(((taxableAmount * TAX_RATE_PERCENTAGE) / 100) * 100) / 100;

  // 4. Calculate delivery fee (free above threshold)
  const finalDeliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : deliveryFee;

  // 5. Total
  const grandTotal = Math.round((taxableAmount + tax + finalDeliveryFee) * 100) / 100;

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    deliveryFee: finalDeliveryFee,
    grandTotal,
    currency: 'INR',
  };
};

export default {
  calculateOrderTotals,
  TAX_RATE_PERCENTAGE,
  DEFAULT_DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
};
