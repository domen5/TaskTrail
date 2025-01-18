import { Schema, model } from "mongoose";

interface WorkedHours {
    date: string,
    project: string,
    hours: number,
    description?: string,
    overtime: boolean,
}

const workedHoursSchema = new Schema<WorkedHours>({
    date: { type: String, required: true },
    project: { type: String, required: true },
    hours: { type: Number, required: true },
    description: { type: String, required: false },
    overtime: { type: Boolean, required: true },
});

const WorkedHoursModel = model<WorkedHours>('WorkedHour', workedHoursSchema);

export default WorkedHours;
export { WorkedHoursModel };
