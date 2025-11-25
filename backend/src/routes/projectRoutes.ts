import express from 'express';
import { 
    createProject, 
    getProject, 
    getUserProjects, 
    updateProject, 
    deleteProject, 
    addUserToProject, 
    removeUserFromProject,
} from '../db/projectStore';
import { Project } from '../models/Projects';
import { InputError } from '../utils/errors';
import { verifyToken } from '../utils/auth';
import { AuthRequest } from '../types/auth';

const routes = express.Router();

// CREATE project
routes.post('/', verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.body.project) {
            throw new InputError('Project is required');
        }

        if (!req.body.project.name) {
            throw new InputError('Name is required');
        }

        const newProject: Project = {
            name: req.body.project.name,
            description: req.body.project.description,
            active: req.body.project.active !== undefined ? req.body.project.active : true,
        };
        const project = await createProject(newProject);
        res.status(201).json(project);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            if (error.message && error.message.includes('duplicate key error')) {
                res.status(400).json({ error: 'Project already exists' });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
});

// READ project
routes.get('/:id', verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.params.id) {
            throw new InputError('Project ID is required');
        }
        const project = await getProject(req.params.id);
        res.status(200).json(project);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// GET user projects - fixed route path to avoid conflicts
routes.get('/user/projects', verifyToken, async (req: AuthRequest, res) => {
    try {
        const projects = await getUserProjects(req.user._id);
        res.status(200).json(projects);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// UPDATE project
routes.put('/:id', verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.params.id) {
            throw new InputError('Project ID is required');
        }
        
        if (!req.body.project) {
            throw new InputError('Project updates are required');
        }
        
        const updates: Partial<Project> = {};
        
        if (req.body.project.name !== undefined) updates.name = req.body.project.name;
        if (req.body.project.description !== undefined) updates.description = req.body.project.description;
        if (req.body.project.active !== undefined) updates.active = req.body.project.active;
        
        const updatedProject = await updateProject(req.params.id, updates);
        res.status(200).json(updatedProject);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// DELETE project (soft delete)
routes.delete('/:id', verifyToken, async (req: AuthRequest, res) => {
    try {
        if (!req.params.id) {
            throw new InputError('Project ID is required');
        }
        
        const deletedProject = await deleteProject(req.params.id);
        res.status(200).json(deletedProject);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// ADD user to project
routes.post('/:projectId/users/:userId', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { projectId, userId } = req.params;
        
        if (!projectId || !userId) {
            throw new InputError('Project ID and User ID are required');
        }
        
        const project = await addUserToProject(projectId, userId);
        res.status(200).json(project);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// REMOVE user from project
routes.delete('/:projectId/users/:userId', verifyToken, async (req: AuthRequest, res) => {
    try {
        const { projectId, userId } = req.params;
        
        if (!projectId || !userId) {
            throw new InputError('Project ID and User ID are required');
        }
        
        await removeUserFromProject(projectId, userId);
        res.status(200).json({ message: 'User removed from project successfully' });
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});


export default routes;