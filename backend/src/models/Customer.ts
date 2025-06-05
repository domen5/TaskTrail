import { Schema, model, Types } from "mongoose";

interface Customer {
    name: string;
    address: string;
    email?: string;
    phone?: string;
    user: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const customerSchema = new Schema<Customer>({
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: false },
    phone: { type: String, required: false },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const CustomerModel = model<Customer>('Customer', customerSchema);

export default Customer;
export { CustomerModel };
