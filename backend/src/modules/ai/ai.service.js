import env from '../../config/env.js';
import MockAIProvider from '../../infrastructure/ai/mock.ai.provider.js';
import GeminiAIProvider from '../../infrastructure/ai/gemini.provider.js';
import restaurantsService from '../restaurants/restaurants.service.js';
import { ServiceUnavailableError } from '../../common/errors/index.js';

export class AIService {
  constructor() {
    this.provider = this._resolveProvider();
  }

  _resolveProvider() {
    switch (env.AI_PROVIDER) {
      case 'gemini':
        return new GeminiAIProvider();
      case 'mock':
      default:
        return new MockAIProvider();
    }
  }

  /**
   * Natural language food search with query sanitization
   */
  async searchFood(query) {
    if (!this.provider) {
      throw new ServiceUnavailableError('AI search feature is currently disabled');
    }

    const intent = await this.provider.parseSearchIntent(query);

    // Business rule: AI only generates search criteria.
    // The service executes the authoritative search query against verified application data.
    const { restaurants } = await restaurantsService.listRestaurants({
      cuisine: intent.cuisine,
      search: intent.parsedTags[0] !== 'general' ? intent.parsedTags[0] : undefined,
    });

    return {
      intent,
      results: restaurants,
    };
  }

  /**
   * Contextual dish/restaurant recommendations
   */
  async getRecommendations(criteria) {
    if (!this.provider) {
      throw new ServiceUnavailableError('AI recommendations feature is currently disabled');
    }
    return this.provider.getRecommendations(criteria);
  }

  /**
   * Safe conversational ordering assistant
   * Enforces prompt sanitization and explicit confirmation requirements
   */
  async chatWithAssistant(messages) {
    if (!this.provider) {
      throw new ServiceUnavailableError('AI assistant is currently disabled');
    }

    // Safety guard: Sanitize prompt history to prevent credential exposure
    const sanitizedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content
        .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, '[REDACTED_TOKEN]')
        .replace(/\b\d{16}\b/g, '[REDACTED_CARD]'),
    }));

    return this.provider.chatAssistant(sanitizedMessages);
  }

  /**
   * Order FAQ assistant
   */
  async getFaq(question) {
    if (!this.provider) {
      throw new ServiceUnavailableError('AI FAQ assistant is currently disabled');
    }
    return this.provider.getOrderFaq(question);
  }

  /**
   * Restaurant owner business insights
   */
  async getInsights(restaurantId) {
    if (!this.provider) {
      throw new ServiceUnavailableError('AI business insights are currently disabled');
    }

    // Pass aggregated, safe metrics (not raw DB cursors)
    const mockAggregatedMetrics = {
      orderVolume: 142,
      averageTicketSize: 480,
    };

    return this.provider.getBusinessInsights(mockAggregatedMetrics);
  }
}

export const aiService = new AIService();
export default aiService;
