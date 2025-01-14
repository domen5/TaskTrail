import express from 'express';
import { addWorkedHours, getWorkedHours, getAllWorkedHours } from '../db/dataStore.js';

const routes = express.Router();

routes.post('/worked-hours', (req, res) => {
    console.log(req.body);

    const formData = req.body;
    addWorkedHours(formData);
    res.status(201).send({ message: 'Worked hours added successfully' });
});

routes.get('/worked-hours/:year/:month/:day', (req, res) => {
    const { year, month, day } = req.params;
    const data = getWorkedHours(parseInt(year), parseInt(month), parseInt(day));
    res.status(200).json(data);
});

routes.get('/worked-hours', (req, res) => {
    const data = getAllWorkedHours();
    res.status(200).json(data);
});

export default routes;