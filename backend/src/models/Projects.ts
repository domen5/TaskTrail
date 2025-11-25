import mongoose, { Types } from "mongoose";

export interface Project {
    name: string;
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProjectSchema = new mongoose.Schema<Project>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    active: { type: Boolean, required: true, default: true },
}, { timestamps: true });

ProjectSchema.index({ name: 1 }, { unique: true });
ProjectSchema.index({ active: 1 });

const ProjectModel = mongoose.model<Project>('Project', ProjectSchema);

export default Project;
export { ProjectModel };
