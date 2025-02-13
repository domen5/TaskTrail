import Organization, {OrganizationModel} from "../models/Organization";
import { Types } from "mongoose";

const createOrganization = async (organization: Organization) => {
    const newOrganization = await OrganizationModel.create(organization);
    return newOrganization;
};

const getOrganizationById = async (organizationId: Types.ObjectId) => {
    const organization = await OrganizationModel.findById(organizationId);
    return organization;
};

const getOrganizationByName = async (organizationName: string) => {
    const organization = await OrganizationModel.findOne({ name: organizationName });
    return organization;
};

export { createOrganization, getOrganizationById, getOrganizationByName };
