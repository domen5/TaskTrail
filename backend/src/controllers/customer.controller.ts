import Customer, { CustomerDocument } from '../models/Customer';
import { CrudController } from '../routes/crud.controller';
import CustomerService from '../services/customer.service';
import { z } from 'zod';
import customerSchema from '../schemas/customerSchema';

type CustomerCreate = z.infer<typeof customerSchema>;
type CustomerUpdate = z.infer<ReturnType<typeof customerSchema.partial>>;

class CustomerController extends CrudController<
    Customer,
    CustomerDocument,
    CustomerCreate,
    CustomerUpdate
> {
    constructor() {
        super(new CustomerService(), 'Customer');
    }
}

export default CustomerController;