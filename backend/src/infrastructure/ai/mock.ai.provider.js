import { AIProviderInterface } from './ai.provider.interface.js';

/**
 * Mock AI Provider implementation for local testing and isolated environments
 */
export class MockAIProvider extends AIProviderInterface {
  async parseSearchIntent(query) {
    const lowercase = query.toLowerCase();
    const tags = [];
    let cuisine;

    if (lowercase.includes('pizza')) {
      tags.push('italian', 'fast-food');
      cuisine = 'Italian';
    } else if (lowercase.includes('sushi')) {
      tags.push('japanese', 'healthy');
      cuisine = 'Japanese';
    } else if (lowercase.includes('burger')) {
      tags.push('american', 'comfort-food');
      cuisine = 'American';
    } else {
      tags.push('general');
    }

    return {
      parsedTags: tags,
      cuisine,
      maxPrice: lowercase.includes('cheap') ? 15 : undefined,
      dietaryPreferences: lowercase.includes('vegan') ? ['vegan'] : [],
    };
  }

  async getRecommendations(criteria) {
    return {
      recommendations: [
        {
          id: 'dish-mock-1',
          name: 'Artisanal Margherita Pizza',
          reason: 'Matches your preference for Italian comfort dining',
        },
        {
          id: 'dish-mock-2',
          name: 'Crispy Veg Truffle Burger',
          reason: 'Trending among users in your locality',
        },
      ],
    };
  }

  async chatAssistant(conversationHistory) {
    const lastMessage = conversationHistory[conversationHistory.length - 1]?.content || '';
    const lowercase = lastMessage.toLowerCase();

    if (lowercase.includes('order') || lowercase.includes('checkout') || lowercase.includes('buy')) {
      return {
        reply: 'I can help you place this order. Would you like me to proceed with checkout?',
        intent: 'ORDER_INTENT',
        requiresConfirmation: true,
        proposedAction: {
          action: 'CONFIRM_CHECKOUT',
          warning: 'This action will charge your selected payment method after confirmation.',
        },
      };
    }

    return {
      reply: `I understand you said: "${lastMessage}". How can I help you choose delicious food today?`,
      intent: 'GENERAL_INQUIRY',
      requiresConfirmation: false,
    };
  }

  async getOrderFaq(question) {
    return {
      answer:
        'Standard food deliveries arrive in 30-45 minutes. You can track your rider in real time on the order screen.',
      confidence: 0.95,
    };
  }

  async getBusinessInsights(aggregatedMetrics) {
    return {
      insights: [
        'Weekend dinner hours account for 62% of peak revenue.',
        'Customer satisfaction is highest when preparation takes under 18 minutes.',
      ],
      recommendations: [
        'Consider bundling beverage combos on Friday evenings to increase average order value.',
      ],
    };
  }
}

export default MockAIProvider;
