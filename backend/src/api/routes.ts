import express from 'express';
import { createWorkedHours, getWorkedHours, getMonthWorkedHours, deleteWorkedHours, updateWorkedHours } from '../db/dataStore';
import WorkedHours from '../models/WorkedHours';
import { InputError } from '../utils/errors';
import { verifyToken } from '../utils/auth';
import { Types } from 'mongoose';
import { AuthRequest } from '../types/auth';
import { isMonthLocked, setLockedMonth } from '../db/lockedMonthStore';

const routes = express.Router();

// CREATE WorkedHours
routes.post('/worked-hours/:year/:month/:day', verifyToken, async (req: AuthRequest, res) => {
    const { year, month, day } = req.params;
    const formData: WorkedHours = {
        user: new Types.ObjectId(req.user._id),
        date: new Date(req.body.workedHours.date),
        project: req.body.workedHours.project,
        hours: req.body.workedHours.hours,
        description: req.body.workedHours.description,
        overtime: req.body.workedHours.overtime,
    };
    try {
        const response = await createWorkedHours(parseInt(year), parseInt(month), parseInt(day), formData);
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
    const { year, month, day } = req.params;
    try {
        const data = await getWorkedHours(
            parseInt(year),
            parseInt(month),
            parseInt(day),
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
    const id = req.body.workedHours._id;
    try {
        const formData: WorkedHours = {
            user: new Types.ObjectId(req.user._id),
            date: new Date(req.body.workedHours.date),
            project: req.body.workedHours.project,
            hours: req.body.workedHours.hours,
            description: req.body.workedHours.description,
            overtime: req.body.workedHours.overtime,
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
        const id = req.body.id;
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
    const { year, month } = req.params;
    try {
        const data = await getMonthWorkedHours(
            parseInt(year),
            parseInt(month),
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
        const { year, month } = req.params;

        if (!year || !month) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            res.status(400).json({ message: 'Year and month must be valid numbers' });
            return;
        }

        // const user = await UserModel.findById(req.user._id);
        // if (!user) {
        //     res.status(404).json({ message: 'User not found' });
        //     return;
        // }

        await setLockedMonth(
            new Types.ObjectId(req.user._id),
            yearNum,
            monthNum,
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
        const { year, month, isLocked } = req.body;

        if (!year || !month || isLocked === undefined) {
            res.status(400).json({ message: 'Missing required parameters: year, month, and isLocked are required' });
            return;
        }

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            res.status(400).json({ message: 'Year and month must be valid numbers' });
            return;
        }

        if (monthNum < 1 || monthNum > 12) {
            res.status(400).json({ message: 'Month must be between 1 and 12' });
            return;
        }

        if (yearNum < 1900 || yearNum > 9999) {
            res.status(400).json({ message: 'Year must be between 1900 and 9999' });
            return;
        }

        const isLockedBool = isLocked === 'true';

        await setLockedMonth(
            new Types.ObjectId(req.user._id),
            yearNum,
            monthNum,
            new Types.ObjectId(req.user._id),
            isLockedBool
        );

        if (isLockedBool) {
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
        const { year, month } = req.params;

        if (!year || !month) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            res.status(400).json({ message: 'Year and month must be valid numbers' });
            return;
        }

        // const user = await UserModel.findById(req.user._id);
        // if (!user) {
        //     res.status(404).json({ message: 'User not found' });
        //     return;
        // }

        const isLocked = await isMonthLocked(new Types.ObjectId(req.user._id), yearNum, monthNum);

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