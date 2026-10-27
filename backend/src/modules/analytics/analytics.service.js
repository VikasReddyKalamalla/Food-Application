/**
 * Analytics Service (Phase 1 Foundation Scaffold)
 * Ready for Phase 2 MongoDB Aggregation Pipelines
 */
export class AnalyticsService {
  async getRestaurantMetrics(restaurantId) {
    return {
      restaurantId,
      totalOrders: 34,
      totalRevenue: 18450,
      averageRating: 4.6,
      topDishes: ['Truffle Burger', 'Paneer Tikka Roll'],
    };
  }

  async getPlatformMetrics() {
    return {
      activeUsers: 120,
      activeOrders: 15,
      totalRestaurants: 8,
      grossMerchandiseValue: 124500,
    };
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
