import { z } from 'zod';

export const aiSearchSchema = z.object({
  query: z.string().trim().min(1, 'Search query cannot be empty').max(200),
});

export const aiChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string().trim().min(1).max(1000),
      })
    )
    .min(1, 'At least one message is required'),
});

export const aiFaqSchema = z.object({
  question: z.string().trim().min(1, 'Question cannot be empty').max(300),
});

export const aiRecommendationsSchema = z.object({
  cuisine: z.string().optional(),
  dietary: z.array(z.string()).optional(),
  maxPrice: z.coerce.number().positive().optional(),
});
