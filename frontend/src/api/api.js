import { BACKEND_URL } from '../utils/config';
// Get month data from the backend; Assumes 0 based months
const getMonthWorkedHoursApiCall = async (year, month) => {
    const newMonth = month + 1; // Backend API expects 1-based months
    const url = `${BACKEND_URL}/api/worked-hours/${year}/${newMonth}`;

    try {
        const response = await fetch(url, {
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch month data from backend');
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error('Retrieved bad data from backend, expected an array.');
        }

        // Aggregate records with the same date into an array
        const newData = data.reduce((acc, item) => {
            if (item.date) {
                // If the date already exists in the accumulator, push the item to the array
                if (!acc[item.date]) {
                    acc[item.date] = [];
                }
                acc[item.date].push(item);
            } else {
                console.warn('Item without date:', item);
            }
            return acc;
        }, {});

        return newData;

    } catch (error) {
        console.error('Error fetching month data:', error);
        throw error;
    }
};

const createWorkedHoursApiCall = async (date, formData) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const url = `${BACKEND_URL}/api/worked-hours/${year}/${month}/${day}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workedHours: formData
        }),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed post day data to backend');
    }
    const data = await response.json();
    return data;

};

const deleteWorkedHoursApiCall = async (id) => {
    if (!id) {
        console.error('Error: ID is undefined in deleteWorkedHours');
        throw new Error('Failed deleting workedHours with id: ' + id);
    }
    const url = `${BACKEND_URL}/api/worked-hours`;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id
        }),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed deleting workedHours with id: ' + id);
    }
};

const updateWorkedHoursApiCall = async (workedHours) => {
    if (!workedHours._id || typeof workedHours._id !== 'string' || workedHours._id.length === 0) {
        console.error('Error: ID is invalid in updateWorkedHoursApiCall');
        throw new Error('Failed updating workedHours with id: ' + workedHours._id);
    }
    if (!workedHours.date || typeof workedHours.date !== 'string' || workedHours.date.length === 0) {
        //todo check if valid key
        console.error('Error: Date is invalid in updateWorkedHoursApiCall');
        throw new Error('Failed updating workedHours with id: ' + workedHours._id);
    }
    const url = `${BACKEND_URL}/api/worked-hours`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "workedHours": workedHours }),
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed updating workedHours with id: ' + workedHours._id);
    }
    return await response.json();
}

export {
    getMonthWorkedHoursApiCall,
    createWorkedHoursApiCall,
    deleteWorkedHoursApiCall,
    updateWorkedHoursApiCall
};