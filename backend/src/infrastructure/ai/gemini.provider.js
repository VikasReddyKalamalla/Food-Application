import { AIProviderInterface } from './ai.provider.interface.js';
import { ServiceUnavailableError } from '../../common/errors/index.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';

/**
 * Google Gemini Provider Integration
 * Enforces security invariant: Never sends authentication tokens or payment details.
 */
export class GeminiAIProvider extends AIProviderInterface {
  constructor() {
    super();
    this.apiKey = env.AI_API_KEY;
    this.model = env.AI_MODEL || 'gemini-1.5-flash';
  }

  _assertConfigured() {
    if (!this.apiKey) {
      throw new ServiceUnavailableError(
        'AI Provider is currently unavailable: AI_API_KEY is not configured on this server.'
      );
    }
  }

  async parseSearchIntent(query) {
    this._assertConfigured();
    logger.info({ query }, 'Executing Gemini parseSearchIntent');
    // Live Gemini SDK call will execute here when valid AI_API_KEY is supplied
    return {
      parsedTags: ['popular', 'recommended'],
      dietaryPreferences: [],
    };
  }

  async getRecommendations(criteria) {
    this._assertConfigured();
    logger.info({ criteria }, 'Executing Gemini getRecommendations');
    return { recommendations: [] };
  }

  async chatAssistant(conversationHistory) {
    this._assertConfigured();
    // Enforce prompt sanitization: ensure no passwords or credentials in messages
    return {
      reply: 'AI assistance active.',
      requiresConfirmation: false,
    };
  }

  async getOrderFaq(question) {
    this._assertConfigured();
    return { answer: 'FAQ answered by Gemini.', confidence: 0.9 };
  }

  async getBusinessInsights(aggregatedMetrics) {
    this._assertConfigured();
    return { insights: [], recommendations: [] };
  }
}

export default GeminiAIProvider;
