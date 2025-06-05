import { Types } from 'mongoose';
import { CustomerModel } from '../models/Customer';
import Customer from '../models/Customer';
import { InputError } from '../utils/errors';

// CREATE Customer
export async function createCustomer(customerData: Omit<Customer, 'createdAt' | 'updatedAt'> & { user: Types.ObjectId }): Promise<Customer> {
    try {
        const customer = new CustomerModel({
            ...customerData,
            user: customerData.user
        });
        
        const savedCustomer = await customer.save();
        return savedCustomer.toObject();
    } catch (error) {
        if (error.code === 11000) {
            throw new InputError('Customer already exists');
        }
        throw error;
    }
}

// READ Customer by ID
export async function getCustomer(customerId: string, userId: Types.ObjectId): Promise<Customer | null> {
    try {
        const customer = await CustomerModel.findOne({
            _id: new Types.ObjectId(customerId),
            user: userId
        }).lean();
        
        return customer;
    } catch (error) {
        throw error;
    }
}

// READ All Customers for user
export async function getAllCustomers(userId: Types.ObjectId): Promise<Customer[]> {
    try {
        const customers = await CustomerModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .lean();
        
        return customers;
    } catch (error) {
        throw error;
    }
}

// UPDATE Customer
export async function updateCustomer(customerId: string, customerData: Omit<Customer, 'createdAt' | 'updatedAt'> & { user: Types.ObjectId }): Promise<Customer | null> {
    try {
        const updatedCustomer = await CustomerModel.findOneAndUpdate(
            { 
                _id: new Types.ObjectId(customerId),
                user: customerData.user
            },
            {
                name: customerData.name,
                address: customerData.address,
                email: customerData.email,
                phone: customerData.phone
            },
            { 
                new: true, 
                runValidators: true 
            }
        ).lean();

        if (!updatedCustomer) {
            throw new InputError('Customer not found or you do not have permission to update it');
        }

        return updatedCustomer;
    } catch (error) {
        throw error;
    }
}

// DELETE Customer
export async function deleteCustomer(customerId: string, userId: Types.ObjectId): Promise<void> {
    try {
        const result = await CustomerModel.findOneAndDelete({
            _id: new Types.ObjectId(customerId),
            user: userId
        });

        if (!result) {
            throw new InputError('Customer not found or you do not have permission to delete it');
        }
    } catch (error) {
        throw error;
    }
}
