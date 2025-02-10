import mongoose from "mongoose";

interface Organization {
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const organizationSchema = new mongoose.Schema<Organization>(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

const OrganizationModel = mongoose.model("Organization", organizationSchema);

export default Organization;
export { OrganizationModel };