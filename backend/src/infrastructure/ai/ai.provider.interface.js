/**
 * AI Provider Abstract Interface
 * Any AI provider (Gemini, OpenAI, Anthropic, or Mock) must adhere to this interface.
 */
export class AIProviderInterface {
  /**
   * Natural language food and cuisine search intent parsing
   * @param {string} query
   * @returns {Promise<{ parsedTags: string[], cuisine?: string, maxPrice?: number, dietaryPreferences: string[] }>}
   */
  async parseSearchIntent(query) {
    throw new Error('Method parseSearchIntent() must be implemented');
  }

  /**
   * Generates contextual dish/restaurant recommendations based on structured user history/preferences
   * @param {object} criteria
   * @returns {Promise<{ recommendations: Array<{ id: string, reason: string }> }>}
   */
  async getRecommendations(criteria) {
    throw new Error('Method getRecommendations() must be implemented');
  }

  /**
   * Conversational food ordering assistant
   * NOTE: Any consequential action (checkout, cancel) emits an explicit confirmation intent.
   * @param {Array<{ role: string, content: string }>} conversationHistory
   * @returns {Promise<{ reply: string, intent?: string, requiresConfirmation: boolean, proposedAction?: object }>}
   */
  async chatAssistant(conversationHistory) {
    throw new Error('Method chatAssistant() must be implemented');
  }

  /**
   * Order-related FAQ answers
   * @param {string} question
   * @returns {Promise<{ answer: string, confidence: number }>}
   */
  async getOrderFaq(question) {
    throw new Error('Method getOrderFaq() must be implemented');
  }

  /**
   * Restaurant owner business insights
   * @param {object} aggregatedMetrics
   * @returns {Promise<{ insights: string[], recommendations: string[] }>}
   */
  async getBusinessInsights(aggregatedMetrics) {
    throw new Error('Method getBusinessInsights() must be implemented');
  }
}

export default AIProviderInterface;
