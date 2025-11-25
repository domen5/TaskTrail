import express, { Response } from 'express';
import { verifyToken } from '../utils/auth';
import { AuthRequest } from '../types/auth';
import { Types } from 'mongoose';
import { UserModel } from '../models/User';
import { setLockedMonth } from '../db/lockedMonthStore';
import { InputError } from '../utils/errors';

const routes = express.Router();

// Lock Month
routes.post('/:year/:month/:userId/lock', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const { year, month, userId } = req.params;

        if (!year || !month || !userId) {
            res.status(400).json({ message: 'Missing required parameters' });
            return;
        }

        const yearNum = parseInt(year);
        const monthNum = parseInt(month);

        if (isNaN(yearNum) || isNaN(monthNum)) {
            res.status(400).json({ message: 'Year and month must be valid numbers' });
            return;
        }

        if (!Types.ObjectId.isValid(userId)) {
            res.status(400).json({ message: 'Invalid user ID format' });
            return;
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const accountant = await UserModel.findById(req.user._id);
        if (!accountant) {
            res.status(404).json({ message: 'Accountant not found' });
            return;
        }

        if (accountant.role !== 'accountant') {
            res.status(403).json({ message: 'Access Denied: You are not authorized to perform this action' });
            return;
        }

        await setLockedMonth(
            user._id,
            yearNum,
            monthNum,
            accountant._id,
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

export default routes;
