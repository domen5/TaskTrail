import { Schema, model, Types, Document } from "mongoose";
import { BaseEntity } from "../db/base.store";

interface Customer extends BaseEntity {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    user: Types.ObjectId;
}

// Mongoose document type
interface CustomerDocument extends Document {
    name: string;
    address: string;
    email?: string;
    phone?: string;
    user: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const customerSchema = new Schema<CustomerDocument>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const CustomerModel = model<CustomerDocument>('Customer', customerSchema);

export default Customer;
export { CustomerModel, CustomerDocument };
