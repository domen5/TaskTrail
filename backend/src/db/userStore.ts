import User, { UserModel } from "../models/User";

export const registerUser = async (user: User) => {
    try {
        await UserModel.create(user);
        return user;
    } catch (err) {
        throw err;
    }
};

export const retrieveUser = async (user: User) => {
    try {
        const foundUser = await UserModel.findOne({ username: user.username });
        return foundUser;
    } catch (err) {
        throw err;
    }
};