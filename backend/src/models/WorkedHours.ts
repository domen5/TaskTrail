import { Schema, model } from "mongoose";

interface WorkedHours {
    date: Date,
    project: string,
    hours: number,
    description?: string,
    overtime: boolean,
    createdAt?: Date,
    updatedAt?: Date,
}

const workedHoursSchema = new Schema<WorkedHours>({
    date: { type: Date, required: true },
    project: { type: String, required: true },
    hours: { type: Number, required: true },
    description: { type: String, required: false },
    overtime: { type: Boolean, required: true },
  },
  { timestamps: true }
);

const WorkedHoursModel = model<WorkedHours>('WorkedHour', workedHoursSchema);

export default WorkedHours;
export { WorkedHoursModel };
