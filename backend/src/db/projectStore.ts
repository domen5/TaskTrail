import Project, { ProjectModel } from "../models/Projects";
import { InputError } from "../utils/errors";

export const createProject = async (project: Project): Promise<Project> => {
    if (!project.name.trim()) {
        throw new InputError('Project name is required');
    }
    const newProject = new ProjectModel(project);
    await newProject.save();
    return newProject;
}

export const getProject = async (userId: string): Promise<Project[]> => {
    const projects = await ProjectModel.find({ organization: userId });
    return projects;
}

export const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
        const project = await ProjectModel.findByIdAndUpdate(
            projectId,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!project) {
            throw new InputError('Project not found');
        }

        return project;
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.code === 11000) {
            throw new InputError('A project with this name already exists in your organization');
        }
        if (err.name === 'CastError') {
            throw new InputError('Invalid project ID format');
        }
        throw err;
    }
};

export const deleteProject = async (projectId: string) => {
    try {
        // Soft delete: set active to false
        const project = await ProjectModel.findByIdAndUpdate(
            projectId,
            { active: false },
            { new: true }
        );

        if (!project) {
            throw new InputError('Project not found');
        }

        return project;
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.name === 'CastError') {
            throw new InputError('Invalid project ID format');
        }
        throw err;
    }
};