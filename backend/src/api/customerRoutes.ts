import express from 'express';
import { createCustomer, getCustomer, getAllCustomers, updateCustomer, deleteCustomer } from '../db/customerStore';
import Customer from '../models/Customer';
import { InputError } from '../utils/errors';
import { verifyToken } from '../utils/auth';
import { Types } from 'mongoose';
import { AuthRequest } from '../types/auth';
import {
    createCustomerRequestSchema,
    updateCustomerRequestSchema,
    deleteCustomerRequestSchema,
    customerIdParamsSchema
} from '../schemas/requestSchemas';

const customerRoutes = express.Router();

// CREATE Customer
customerRoutes.post('/customers', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = createCustomerRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { customer } = bodyResult.data;
        
        const formData: Omit<Customer, 'createdAt' | 'updatedAt'> & { user: Types.ObjectId } = {
            user: new Types.ObjectId(req.user._id),
            name: customer.name,
            address: customer.address,
            email: customer.email,
            phone: customer.phone,
        };

        const response = await createCustomer(formData);
        res.status(201).json(response);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ message: err.message || 'Bad input' });
            return;
        }
        console.error('Error creating customer:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// READ All Customers
customerRoutes.get('/customers', verifyToken, async (req: AuthRequest, res) => {
    try {
        const customers = await getAllCustomers(new Types.ObjectId(req.user._id));
        res.status(200).json(customers);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ message: 'Bad input' });
            return;
        }
        console.error('Error fetching customers:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// READ Customer by ID
customerRoutes.get('/customers/:id', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = customerIdParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        const { id } = paramsResult.data;
        const customer = await getCustomer(id, new Types.ObjectId(req.user._id));
        
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return;
        }
        
        res.status(200).json(customer);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ message: 'Bad input' });
            return;
        }
        console.error('Error fetching customer:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// UPDATE Customer
customerRoutes.put('/customers', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = updateCustomerRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { customer } = bodyResult.data;
        const id = customer._id;
        
        const formData: Omit<Customer, 'createdAt' | 'updatedAt'> & { user: Types.ObjectId } = {
            user: new Types.ObjectId(req.user._id),
            name: customer.name,
            address: customer.address,
            email: customer.email,
            phone: customer.phone,
        };
        
        const result = await updateCustomer(id, formData);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ message: err.message || 'Bad input' });
            return;
        }
        console.error('Error updating customer:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// DELETE Customer
customerRoutes.delete('/customers', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = deleteCustomerRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { id } = bodyResult.data;
        await deleteCustomer(id, new Types.ObjectId(req.user._id));
        res.status(200).json({ message: 'Customer deleted successfully' });
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).json({ message: err.message || 'Bad input' });
            return;
        }
        console.error('Error deleting customer:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default customerRoutes;
