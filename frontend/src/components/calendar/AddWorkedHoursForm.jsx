import { useTimeSheet } from "../../context/TimeSheetContext";
import Modal from '../Modal';
import { createKey } from "../../utils/utils";
import WorkedHoursForm from "./WorkedHoursForm";

function AddWorkedHoursForm({ date, onClose }) {
    const { updateDayData } = useTimeSheet();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = {
            date: createKey(date),
            project: e.target.project.value,
            hours: parseInt(e.target.workedHours.value),
            description: e.target.description.value,
            overtime: e.target.inlineRadioOptions.value === 'option1',
        };
        await updateDayData(date, formData);
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
