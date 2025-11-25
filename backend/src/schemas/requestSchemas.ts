import { z } from 'zod';
import { workedHoursSchema } from './workedHoursSchema';
import customerSchema from './customerSchema';
import Roles from '../enums/roles.enum';

export const yearMonthDayParamsSchema = z.object({
  year: z.string().transform(Number).pipe(z.number().int().min(1900).max(2100)),
  month: z.string().transform(Number).pipe(z.number().int().min(1).max(12)),
  day: z.string().transform(Number).pipe(z.number().int().min(1).max(31))
});

export const yearMonthParamsSchema = z.object({
  year: z.string().transform(Number).pipe(z.number().int().min(1900).max(2100)),
  month: z.string().transform(Number).pipe(z.number().int().min(1).max(12))
});

// ObjectId validation helper
const objectIdSchema = z.string().refine((val) => {
  return /^[0-9a-fA-F]{24}$/.test(val);
}, {
  message: "Invalid ObjectId format"
});

export const createWorkedHoursRequestSchema = z.object({
  workedHours: workedHoursSchema.omit({ user: true }) // user comes from token
});

export const updateWorkedHoursRequestSchema = z.object({
  workedHours: workedHoursSchema.omit({ user: true }).extend({
    _id: objectIdSchema
  })
});

export const deleteWorkedHoursRequestSchema = z.object({
  id: objectIdSchema
});

export const lockMonthRequestSchema = z.object({
  year: z.number().int().min(1900).max(2100),
  month: z.number().int().min(1).max(12),
  isLocked: z.boolean()
});

// User authentication schemas
export const loginRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export const registerRequestSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8),
  role: z.nativeEnum(Roles)
}); 

// Customer request schemas
export const createCustomerRequestSchema = z.object({
  customer: customerSchema
});

export const updateCustomerRequestSchema = z.object({
  customer: customerSchema.extend({
    _id: objectIdSchema
  })
});

export const deleteCustomerRequestSchema = z.object({
  id: objectIdSchema
});

export const customerIdParamsSchema = z.object({
  id: objectIdSchema
});