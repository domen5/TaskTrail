import mongoose, { Types } from "mongoose";

export interface Project {
    name: string;
    description?: string;
    organization: Types.ObjectId;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<Project>({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: false },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    active: { type: Boolean, required: true, default: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

const ProjectModel = mongoose.model<Project>('Project', ProjectSchema);

export default Project;
export { ProjectModel };
