import { Schema, model, Types } from "mongoose";

interface LockedMonth {
    userId: Types.ObjectId;
    year: number;
    month: number;
    lockedBy: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const lockedMonthSchema = new Schema<LockedMonth>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    lockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
},
{ timestamps: true }
);

// Create a compound unique index to prevent duplicate locks for same org/year/month
lockedMonthSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true });

const LockedMonthModel = model<LockedMonth>('LockedMonth', lockedMonthSchema);

export default LockedMonth;
export { LockedMonthModel };
