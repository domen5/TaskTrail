import { Types } from "mongoose";
import { OrganizationModel } from "../models/Organization";
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

const retrieveOrganization = async (organizationId: Types.ObjectId) => {
    try {
        const foundOrganization = await OrganizationModel.findOne({ _id: organizationId });
        return foundOrganization;
    } catch (err) {
        throw err;
    }
}

export { registerUser, retrieveUser, retrieveOrganization };
