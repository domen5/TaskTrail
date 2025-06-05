import { z } from 'zod';

export const organizationSchema = z.object({
  name: z.string().min(1)
});

export type Organization = z.infer<typeof organizationSchema>; 