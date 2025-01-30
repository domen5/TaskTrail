import mongoose from "mongoose";

interface User {
    username: string;
    password: string;
}

const userSchema = new mongoose.Schema<User>({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const UserModel = mongoose.model("User", userSchema);

export default User;
export { UserModel };