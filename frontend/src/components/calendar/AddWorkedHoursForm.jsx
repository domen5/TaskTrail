import { useTimeSheet } from "../../context/TimeSheetContext";
import Modal from '../Modal';
import WorkedHoursForm from "./WorkedHoursForm";

function AddWorkedHoursForm({ date, onClose }) {
    const { updateDayData } = useTimeSheet();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            date: date instanceof Date ? date : new Date(date),
            project: e.target.project.value,
            hours: parseInt(e.target.workedHours.value),
            description: e.target.description.value,
            overtime: e.target.inlineRadioOptions.value === 'option1',
        };
        await updateDayData(formData);
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
