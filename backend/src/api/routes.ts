import express from 'express';
import { createWorkedHours, getWorkedHours, getMonthWorkedHours, deleteWorkedHours, updateWorkedHours } from '../db/dataStore';
import WorkedHours from '../models/WorkedHours';
import { InputError } from '../utils/errors';

const routes = express.Router();

routes.post('/worked-hours/:year/:month/:day', async (req, res) => {
    // TODO: remove debug logs
    console.log(req.body);

    const { year, month, day } = req.params;

    const formData: WorkedHours = {
        date: req.body.workedHours.date,
        project: req.body.workedHours.project,
        hours: req.body.workedHours.hours,
        description: req.body.workedHours.description,
        overtime: req.body.workedHours.overtime,
    };
    try {
        const response = await createWorkedHours(parseInt(year), parseInt(month), parseInt(day), formData);
        res.status(201).send(response);
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.get('/worked-hours/:year/:month/:day', async (req, res) => {
    const { year, month, day } = req.params;

    try {
        const data = await getWorkedHours(parseInt(year), parseInt(month), parseInt(day));
        res.status(200).json(data);
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.delete('/worked-hours', async (req, res) => {
    const id = req.body.id;
    try {
        await deleteWorkedHours(id);
        res.status(200).send({ message: 'Delete was successful' }); // 204
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.get('/worked-hours/:year/:month/', async (req, res) => {
    const { year, month } = req.params;
    try {
        const data = await getMonthWorkedHours(parseInt(year), parseInt(month));
        res.status(200).json(data);
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
});

routes.put('/worked-hours', async (req, res) => {
    const id = req.body.workedHours._id;
    const formData: WorkedHours = {
        date: req.body.workedHours.date,
        project: req.body.workedHours.project,
        hours: req.body.workedHours.hours,
        description: req.body.workedHours.description,
        overtime: req.body.workedHours.overtime,
    };
    try {
        const result = await updateWorkedHours(id, formData);
        res.status(200).send(result);
    } catch (err) {
        if (err instanceof InputError) {
            res.status(400).send({ message: 'Bad input' });
            return;
        }
        res.status(500).send({ message: 'Something went wrong' });
    }
})

export default routes;