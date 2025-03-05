import mongoose, { Types } from "mongoose";
import Project, { ProjectModel } from "../models/Projects";
import { UserModel } from "../models/User";
import { InputError } from "../utils/errors";

export const createProject = async (project: Project): Promise<Project> => {
    if (!project.name?.trim()) {
        throw new InputError('Project name is required');
    }

    if (!project.organization) {
        throw new InputError('Organization ID is required');
    }

    const newProject = new ProjectModel(project);
    await newProject.save();
    return newProject;
}

export const getProject = async (projectId: string): Promise<Project> => {
    try {
        const project = await ProjectModel.findById(projectId);
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
}

export const getUserProjects = async (userId: string): Promise<string[]> => {
    try {
        const user = await UserModel.findById(userId);

        if (!user) {
            throw new InputError('User not found');
        }

        const projects = await ProjectModel.find({
            _id: { $in: user.projects }
        });

        return projects.map(project => project.name);

    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.name === 'CastError') {
            throw new InputError('Invalid user ID format');
        }
        console.error('Error retrieving user projects:', err);
        throw err;
    }
};

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
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const project = await ProjectModel.findByIdAndUpdate(
                projectId,
                { active: false },
                { new: true, session }
            );

            if (!project) {
                throw new InputError('Project not found');
            }

            await UserModel.updateMany(
                { projects: new Types.ObjectId(projectId) },
                { $pull: { projects: new Types.ObjectId(projectId) } },
                { session }
            );

            await session.commitTransaction();
            return project;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
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

export const addUserToProject = async (projectId: string, userId: string): Promise<Project> => {
    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await UserModel.findById(userId).session(session);
            if (!user) {
                throw new InputError('User not found');
            }

            const project = await ProjectModel.findByIdAndUpdate(
                projectId,
                { $addToSet: { users: new Types.ObjectId(userId) } },
                { new: true, session }
            );

            if (!project) {
                throw new InputError('Project not found');
            }

            if (!project.organization.equals(user.organization)) {
                throw new InputError('User and project must belong to the same organization');
            }

            await UserModel.findByIdAndUpdate(
                userId,
                { $addToSet: { projects: new Types.ObjectId(projectId) } },
                { session }
            );

            await session.commitTransaction();
            return project;
        } catch (err) {
            await session.abortTransaction();
            throw err;
        } finally {
            session.endSession();
        }
    } catch (err) {
        if (err instanceof InputError) {
            throw err;
        }
        if (err.name === 'CastError') {
            throw new InputError('Invalid ID format');
        }
        throw err;
    }
};

export const getOrganizationProjects = async (organizationId: string): Promise<Project[]> => {
    const projects = await ProjectModel.find({
        organization: new Types.ObjectId(organizationId),
        active: true
    }).sort({ name: 1 });
    return projects;
};
