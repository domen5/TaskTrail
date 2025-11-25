import User, { UserModel } from "../models/User";

const registerUser = async (user: User) => {
    try {
        const newUser = await UserModel.create(user);
        return newUser;
    } catch (err) {
        throw err;
    }
};

const retrieveUser = async (username: string) => {
    try {
        const foundUser = await UserModel.findOne({ username: username });
        return foundUser;
    } catch (err) {
        throw err;
    }
};

export { registerUser, retrieveUser };
