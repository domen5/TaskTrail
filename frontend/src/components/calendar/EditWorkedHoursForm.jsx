import Modal from "../Modal";
import WorkedHoursForm from "./WorkedHoursForm";
import { useTimeSheet } from "../../context/TimeSheetContext";

function EditWorkedHoursForm({ workedHours, onClose }) {
    const { updateWorkedHours } = useTimeSheet();

    const handleSubmit = async (formData) => {
        const newEntry = {
            ...workedHours,
            date: workedHours.date instanceof Date ? workedHours.date : new Date(workedHours.date),
            project: formData.project,
            hours: parseInt(formData.workedHours),
            description: formData.description,
            overtime: formData.overtime,
        }
        await updateWorkedHours(newEntry);
        onClose();
    }

    return (
        <Modal title="Edit Hours" onClose={onClose}>
            <WorkedHoursForm
                handleSubmit={handleSubmit}
                onClose={onClose}
                defaultProject={workedHours.project}
                defaultHours={workedHours.hours}
                defaultDescription={workedHours.description}
                defaultOvertime={workedHours.overtime}
            ></WorkedHoursForm>
        </Modal>
    )
};

export default EditWorkedHoursForm;