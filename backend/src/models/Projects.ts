import mongoose, { Types } from "mongoose";

export interface Project {
    name: string;
    description?: string;
    organization: Types.ObjectId;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProjectSchema = new mongoose.Schema<Project>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    active: { type: Boolean, required: true, default: true },
}, { timestamps: true });

ProjectSchema.index({ name: 1, organization: 1 }, { unique: true });
ProjectSchema.index({ organization: 1, active: 1 });

const ProjectModel = mongoose.model<Project>('Project', ProjectSchema);

export default Project;
export { ProjectModel };
