import { describe, it, expect, vi } from 'vitest';
import { AIService } from '../../src/modules/ai/ai.service.js';
import MockAIProvider from '../../src/infrastructure/ai/mock.ai.provider.js';
import GeminiAIProvider from '../../src/infrastructure/ai/gemini.provider.js';
import { ServiceUnavailableError } from '../../src/common/errors/index.js';

describe('AI Service Layer & Security Boundary', () => {
  it('instantiates MockAIProvider when AI_PROVIDER is mock', () => {
    const aiService = new AIService();
    expect(aiService.provider).toBeInstanceOf(MockAIProvider);
  });

  it('sanitizes messages to remove raw bearer tokens and card numbers before sending to AI', async () => {
    const aiService = new AIService();
    const chatSpy = vi.spyOn(aiService.provider, 'chatAssistant');

    const unsafeMessages = [
      {
        role: 'user',
        content: 'Please use my Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and card 4111222233334444',
      },
    ];

    await aiService.chatWithAssistant(unsafeMessages);

    expect(chatSpy).toHaveBeenCalled();
    const passedMessages = chatSpy.mock.calls[0][0];

    expect(passedMessages[0].content).not.toContain('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
    expect(passedMessages[0].content).not.toContain('4111222233334444');
    expect(passedMessages[0].content).toContain('[REDACTED_TOKEN]');
    expect(passedMessages[0].content).toContain('[REDACTED_CARD]');
  });

  it('GeminiAIProvider throws ServiceUnavailableError if AI_API_KEY is missing', async () => {
    const unconfiguredGemini = new GeminiAIProvider();
    unconfiguredGemini.apiKey = ''; // Explicitly unset

    await expect(unconfiguredGemini.parseSearchIntent('pizza')).rejects.toThrow(
      ServiceUnavailableError
    );
  });
});
