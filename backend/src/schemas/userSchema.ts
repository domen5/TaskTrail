import { z } from 'zod';
import Roles from '../enums/roles.enum';

export const roleSchema = z.nativeEnum(Roles);
export type Role = z.infer<typeof roleSchema>;

export const userSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  role: roleSchema,
});

export type User = z.infer<typeof userSchema>; 