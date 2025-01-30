import User, { UserModel } from "../models/User";

export const register = async (user: User): Promise<User> => {
    try {
        await UserModel.create(user);
        return user;
    } catch (err) {
        throw err;
    }
};

export const login = async (user: User): Promise<User> => {
    try {
        const foundUser = await UserModel.findOne({ username: user.username, password: user.password });
        return foundUser;
    } catch (err) {
        throw err;
    }
};