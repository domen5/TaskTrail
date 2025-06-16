import Customer, { CustomerDocument } from '../models/Customer';
import CustomerStore from '../db/customerStore';
import customerSchema from '../schemas/customerSchema';
import { UserSpecificBaseService } from './userSpecificBase.service';
import { z } from 'zod';

type CustomerCreate = z.infer<typeof customerSchema>;
type CustomerUpdate = z.infer<ReturnType<typeof customerSchema.partial>>;

class CustomerService extends UserSpecificBaseService<
    Customer,
    CustomerDocument,
    CustomerCreate,
    CustomerUpdate
> {
    constructor() {
        const customerStore = new CustomerStore();
        super(customerStore, customerSchema, customerSchema.partial());
    }
}

export default CustomerService; 