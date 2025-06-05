import { z } from 'zod';

export const userProjectSchema = z.object({
  user: z.string(),
  project: z.string(),
});

export type UserProject = z.infer<typeof userProjectSchema>; 