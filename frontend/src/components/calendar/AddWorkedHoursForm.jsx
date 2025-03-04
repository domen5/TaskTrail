import { useTimeSheet } from "../../context/TimeSheetContext";
import Modal from '../Modal';
import WorkedHoursForm from "./WorkedHoursForm";

function AddWorkedHoursForm({ date, onClose }) {
    const { updateDayData } = useTimeSheet();

    const handleSubmit = async (formData) => {
        const data = {
            date: date instanceof Date ? date : new Date(date),
            project: formData.project,
            hours: parseInt(formData.workedHours),
            description: formData.description,
            overtime: formData.overtime,
        };
        await updateDayData(data);
        onClose();
    };

    return (
        <Modal title="Add Hours" onClose={onClose}>
            <WorkedHoursForm
                handleSubmit={handleSubmit}
                onClose={onClose}
            />
        </Modal>
    );
}

export default AddWorkedHoursForm;
