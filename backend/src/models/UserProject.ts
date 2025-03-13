import mongoose, { Types } from "mongoose";

interface UserProject {
    user: Types.ObjectId;
    project: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const UserProjectSchema = new mongoose.Schema<UserProject>(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    },
    { timestamps: true }
);

UserProjectSchema.index({ user: 1, project: 1 }, { unique: true });
UserProjectSchema.index({ user: 1 });
UserProjectSchema.index({ project: 1 });

const UserProjectModel = mongoose.model<UserProject>('UserProject', UserProjectSchema);

export default UserProject;
export { UserProjectModel };
