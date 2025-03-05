import express from 'express';
import { createProject, getProject } from '../db/projectStore';
import { Project } from '../models/Projects';
import { InputError } from '../utils/errors';
import { Types } from 'mongoose';
import { verifyToken } from '../utils/auth';

const routes = express.Router();

routes.post('/', verifyToken, async (req, res) => {
    try {
        if (!req.body.project) {
            throw new InputError('Project is required');
        }

        if (!req.body.project.name || !req.body.project.organization) {
            throw new InputError('Name and organization are required');
        }

        const newProject: Project = {
            name: req.body.project.name,
            description: req.body.project.description,
            organization: Types.ObjectId.createFromHexString(req.body.project.organization),
            active: req.body.project.active,
        };
        const project = await createProject(newProject);
        res.status(201).json(project);
    } catch (error) {
        if (error instanceof InputError) {
            console.error(error);
            res.status(400).json({ error: error.message });
        } else {
            if (error.message.includes('duplicate key error')) {
                res.status(400).json({ error: 'Project already exists' });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    }
});

routes.get('/:id', verifyToken, async (req, res) => {
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

export default routes;