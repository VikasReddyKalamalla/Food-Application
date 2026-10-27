import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid resource identifier format');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
  search: z.string().trim().max(100).optional(),
  sort: z.string().trim().max(50).optional(),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const idempotencyHeaderSchema = z.object({
  'idempotency-key': z.string().uuid().optional(),
});
