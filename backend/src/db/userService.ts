import User, { UserModel } from "../models/User";

export const register = async (user: User): Promise<void> => {
    try {
        await UserModel.create(user);
    } catch (err) {
        throw err;
    }
};

export const login = async (user: User): Promise<void> => {
    try {
        await UserModel.findOne({ username: user.username, password: user.password });
    } catch (err) {
        throw err;
    }
};