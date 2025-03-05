import mongoose, { Types } from "mongoose";
import bcrypt from "bcrypt";

type Role = 'regular' | 'accountant';	
const SALT_ROUNDS = 10;

interface User {
    username: string;
    password: string;
    organization: Types.ObjectId;
    role: Role;
    projects: Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema<User>(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
        role: { type: String, required: true, enum: ['regular', 'accountant'] },
        projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
});

const UserModel = mongoose.model<User>("User", userSchema);

export default User;
export { UserModel, Role };
