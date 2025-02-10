import { Types } from "mongoose";
import { createOrganization, getOrganizationById, getOrganizationByName } from "../db/organizationStore";
import express, { Request, Response } from "express";

const routes = express.Router();

// CREATE Organization
routes.post('/', async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const organization = await createOrganization({ name });
        res.status(201).json(organization);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// READ Organization
routes.get('/', async (req: Request, res: Response) => {
    try {
        const { id, name } = req.query;

        if (!id && !name) {
            res.status(400).json({ message: 'Provide either id or name' });
            return;
        }

        let organization;
        if (id) {
            organization = await getOrganizationById(new Types.ObjectId(id as string));
        } else if (name) {
            organization = await getOrganizationByName(name as string);
        }

        if (!organization) {
            res.status(404).json({ message: 'Organization not found' });
            return;
        }

        res.status(200).json(organization);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default routes;