import { BadRequestError, NotFoundError } from '../../common/errors/index.js';

/**
 * Coupons Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 Mongoose Coupon Schema integration
 */
export class CouponsService {
  constructor() {
    this.coupons = new Map();
    // Default promotional starter coupon
    this.coupons.set('WELCOME50', {
      code: 'WELCOME50',
      discountPercentage: 20,
      maxDiscount: 100,
      minOrderAmount: 200,
      isActive: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }

  async validateCoupon(code, subtotal) {
    if (!code) throw new BadRequestError('Coupon code is required');

    const coupon = this.coupons.get(code.toUpperCase().trim());
    if (!coupon || !coupon.isActive) {
      throw new NotFoundError('Coupon code is invalid or inactive');
    }

    if (new Date() > coupon.expiresAt) {
      throw new BadRequestError('Coupon code has expired');
    }

    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestError(
        `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`
      );
    }

    return coupon;
  }

  async createCoupon(data) {
    const code = data.code.toUpperCase().trim();
    const coupon = {
      code,
      discountPercentage: data.discountPercentage || 0,
      flatDiscount: data.flatDiscount || 0,
      maxDiscount: data.maxDiscount || null,
      minOrderAmount: data.minOrderAmount || 0,
      isActive: true,
      expiresAt: new Date(data.expiresAt || Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
    this.coupons.set(code, coupon);
    return coupon;
  }

  async listActiveCoupons() {
    return Array.from(this.coupons.values()).filter((c) => c.isActive && new Date() <= c.expiresAt);
  }
}

export const couponsService = new CouponsService();
export default couponsService;
