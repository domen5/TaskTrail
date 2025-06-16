import { Types } from 'mongoose';
import { CustomerModel, CustomerDocument } from '../models/Customer';
import BaseStore from './base.store';
import { InputError } from '../utils/errors';

class CustomerStore extends BaseStore<CustomerDocument> {
    constructor() {
        super(CustomerModel);
    }

    // User-specific methods for multi-tenancy
    async findByUser(userId: Types.ObjectId): Promise<CustomerDocument[]> {
        return await this.model.find({ user: userId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findByIdAndUser(id: string, userId: Types.ObjectId): Promise<CustomerDocument | null> {
        return await this.model.findOne({
            _id: id,
            user: userId
        }).exec();
    }

    async updateByIdAndUser(id: string, data: Partial<CustomerDocument>, userId: Types.ObjectId): Promise<CustomerDocument | null> {
        const result = await this.model.findOneAndUpdate(
            { _id: id, user: userId },
            { ...data, updatedAt: new Date() },
            { new: true, runValidators: true }
        ).exec();

        if (!result) {
            throw new InputError('Customer not found or you do not have permission to update it');
        }

        return result;
    }

    async deleteByIdAndUser(id: string, userId: Types.ObjectId): Promise<boolean> {
        const result = await this.model.findOneAndDelete({
            _id: id,
            user: userId
        }).exec();

        if (!result) {
            throw new InputError('Customer not found or you do not have permission to delete it');
        }

        return true;
    }
}

export default CustomerStore;  
