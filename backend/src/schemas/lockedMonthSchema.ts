import { z } from 'zod';

export const lockedMonthSchema = z.object({
  userId: z.string(),
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  lockedBy: z.string(),
});

export type LockedMonth = z.infer<typeof lockedMonthSchema>; 