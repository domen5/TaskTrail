import CustomerController from './customer.controller';
import { errorHandler } from '../utils/errorHandler';

const customerController = new CustomerController();
const customerRoutes = customerController.getRouter();

// Apply error handler
customerRoutes.use(errorHandler);

export default customerRoutes;
