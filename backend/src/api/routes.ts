import express from 'express';
import { addWorkedHours, getWorkedHours, getAllWorkedHours, getMonthWorkedHours } from '../db/dataStore';
import WorkedHours from '../models/WorkedHours';

const routes = express.Router();

routes.post('/worked-hours/:year/:month/:day', (req, res) => {
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
    addWorkedHours(parseInt(year), parseInt(month), parseInt(day), formData); // Pass both date and workedHours to the function
    res.status(201).send({ message: 'Worked hours added successfully' });
});

routes.get('/worked-hours/:year/:month/:day', (req, res) => {
    const { year, month, day } = req.params;
    const data = getWorkedHours(parseInt(year), parseInt(month), parseInt(day));
    res.status(200).json(data);
});

routes.get('/worked-hours/:year/:month/', (req, res) => {
    const { year, month } = req.params;
    const data = getMonthWorkedHours(parseInt(year), parseInt(month));
    res.status(200).json(data);
});

routes.get('/worked-hours', (req, res) => {
    const data = getAllWorkedHours();
    res.status(200).json(data);
});

export default routes;