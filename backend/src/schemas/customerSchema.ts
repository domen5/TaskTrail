import { z } from "zod";

const customerSchema = z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
});

export default customerSchema;