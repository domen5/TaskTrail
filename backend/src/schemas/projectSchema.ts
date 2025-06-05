import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  organization: z.string(),
  active: z.boolean().default(true)
});

export type Project = z.infer<typeof projectSchema>; 