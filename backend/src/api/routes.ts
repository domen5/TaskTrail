import express from 'express';
import { createWorkedHours, getWorkedHours, getMonthWorkedHours, deleteWorkedHours, updateWorkedHours } from '../db/dataStore';
import WorkedHours from '../models/WorkedHours';
import { InputError } from '../utils/errors';
import { verifyToken } from '../utils/auth';

const routes = express.Router();

// CREATE WorkedHours
routes.post('/worked-hours/:year/:month/:day', verifyToken, async (req, res) => {
    const { year, month, day } = req.params;
    const formData: WorkedHours = {
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
routes.get('/worked-hours/:year/:month/:day', verifyToken, async (req, res) => {
    const { year, month, day } = req.params;
    try {
        const data = await getWorkedHours(parseInt(year), parseInt(month), parseInt(day));
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
routes.put('/worked-hours', verifyToken, async (req, res) => {
    const id = req.body.workedHours._id;
    try {
        const formData: WorkedHours = {
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
routes.delete('/worked-hours', verifyToken, async (req, res) => {
    try {
        const id = req.body.id;
        await deleteWorkedHours(id);
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
routes.get('/worked-hours/:year/:month/', verifyToken, async (req, res) => {
    const { year, month } = req.params;
    try {
        const data = await getMonthWorkedHours(parseInt(year), parseInt(month));
        res.status(200).json(data);
    } catch (err) {
        if (err instanceof InputError || err.name === 'ValidationError' || err.name === 'CastError') {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

export default routes;