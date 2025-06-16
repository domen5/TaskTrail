import express from 'express';
import { createWorkedHours, getWorkedHours, getMonthWorkedHours, deleteWorkedHours, updateWorkedHours } from '../db/dataStore';
import WorkedHours from '../models/WorkedHours';
import { InputError } from '../utils/errors';
import { verifyToken } from '../utils/auth';
import { Types } from 'mongoose';
import { AuthRequest } from '../types/auth';
import { isMonthLocked, setLockedMonth } from '../db/lockedMonthStore';
import {
    yearMonthDayParamsSchema,
    yearMonthParamsSchema,
    createWorkedHoursRequestSchema,
    updateWorkedHoursRequestSchema,
    deleteWorkedHoursRequestSchema,
    lockMonthRequestSchema
} from '../schemas/requestSchemas';

const routes = express.Router();

// CREATE WorkedHours
routes.post('/worked-hours/:year/:month/:day', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = yearMonthDayParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        // Validate request body
        const bodyResult = createWorkedHoursRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month, day } = paramsResult.data;
        const { workedHours } = bodyResult.data;
        
        const formData: WorkedHours = {
            user: new Types.ObjectId(req.user._id),
            date: workedHours.date,
            project: workedHours.project,
            hours: workedHours.hours,
            description: workedHours.description,
            overtime: workedHours.overtime,
        };

        const response = await createWorkedHours(year, month, day, formData);
        res.status(201).send(response);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

// READ WorkedHours
routes.get('/worked-hours/:year/:month/:day', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = yearMonthDayParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month, day } = paramsResult.data;
        const data = await getWorkedHours(
            year,
            month,
            day,
            new Types.ObjectId(req.user._id)
        );
        res.status(200).json(data);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

// UPDATE WorkedHours
routes.put('/worked-hours', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = updateWorkedHoursRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { workedHours } = bodyResult.data;
        const id = workedHours._id;
        
        const formData: WorkedHours = {
            user: new Types.ObjectId(req.user._id),
            date: workedHours.date,
            project: workedHours.project,
            hours: workedHours.hours,
            description: workedHours.description,
            overtime: workedHours.overtime,
        };
        const result = await updateWorkedHours(id, formData);
        res.status(200).json(result);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

// DELETE WorkedHours
routes.delete('/worked-hours', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = deleteWorkedHoursRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { id } = bodyResult.data;
        await deleteWorkedHours(id, new Types.ObjectId(req.user._id));
        res.status(200).send({ message: 'Delete was successful' }); // 204
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

// READ Month WorkedHours
routes.get('/worked-hours/:year/:month/', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = yearMonthParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month } = paramsResult.data;
        const data = await getMonthWorkedHours(
            year,
            month,
            new Types.ObjectId(req.user._id)
        );
        res.status(200).json(data);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

// LOCK Month 
routes.post('/lock/:year/:month', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = yearMonthParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month } = paramsResult.data;

        await setLockedMonth(
            new Types.ObjectId(req.user._id),
            year,
            month,
            new Types.ObjectId(req.user._id),
            true
        );
        res.status(200).json({ message: 'Month locked successfully' });
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Error locking month:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// WRITE LockedMonth
routes.post('/month', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate request body
        const bodyResult = lockMonthRequestSchema.safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({
                message: 'Invalid request body',
                errors: bodyResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month, isLocked } = bodyResult.data;

        await setLockedMonth(
            new Types.ObjectId(req.user._id),
            year,
            month,
            new Types.ObjectId(req.user._id),
            isLocked
        );

        if (isLocked) {
            res.status(200).json({ message: 'Month locked successfully' });
        } else {
            res.status(200).json({ message: 'Month unlocked successfully' });
        }
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Error locking month:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

// VERIFY Month
routes.get('/lock/:year/:month', verifyToken, async (req: AuthRequest, res) => {
    try {
        // Validate route parameters
        const paramsResult = yearMonthParamsSchema.safeParse(req.params);
        if (!paramsResult.success) {
            res.status(400).json({
                message: 'Invalid route parameters',
                errors: paramsResult.error.flatten().fieldErrors
            });
            return;
        }

        const { year, month } = paramsResult.data;

        const isLocked = await isMonthLocked(new Types.ObjectId(req.user._id), year, month);

        res.status(200).json({ 'isLocked': isLocked });
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).json({ message: err.message });
            return;
        }
        console.error('Error locking month:', err);
        res.status(500).json({ message: 'Something went wrong' });
    }
});

export default routes;