import { z } from 'zod';

export const workedHoursSchema = z.object({
  user: z.string(),
  date: z.coerce.date(),
  project: z.string(),
  hours: z.number().positive(),
  description: z.string().optional(),
  overtime: z.boolean(),
});

export type WorkedHours = z.infer<typeof workedHoursSchema>; 