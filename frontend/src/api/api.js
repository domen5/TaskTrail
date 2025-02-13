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

const createWorkedHoursApiCall = async (formData) => {
    if (!formData.date || !(formData.date instanceof Date)) {
        throw new Error('Invalid date in formData');
    }

    const year = formData.date.getFullYear();
    const month = formData.date.getMonth() + 1;
    const day = formData.date.getDate();

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
    if (!workedHours.date || !(workedHours.date instanceof Date)) {
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

const lockMonthApiCall = async (year, month, isLocked) => {
    const newMonth = month + 1;
    if (!year || !newMonth) {
        throw new Error('Missing required parameters');
    }
    if (year < 2000 || year > 2500) {
        throw new Error('Invalid year');
    }
    if (newMonth < 1 || newMonth > 12) {
        throw new Error('Invalid month');
    }
    // const url = `${BACKEND_URL}/api/lock/${year}/${newMonth}`;
    const url = `${BACKEND_URL}/api/month`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            year: year,
            month: newMonth,
            isLocked: isLocked
        }),
        credentials: 'include'
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error('Failed locking month, response: ' + response.status + ' data: ' + JSON.stringify(data));
    }
    return data;
}

const verifyLockedMonthApiCall = async (year, month) => {
    const newMonth = month + 1;
    if (!year || !newMonth) {
        throw new Error('Missing required parameters');
    }
    if (year < 2000 || year > 2500) {
        throw new Error('Invalid year');
    }
    if (newMonth < 1 || newMonth > 12) {
        throw new Error('Invalid month');
    }

    const url = `${BACKEND_URL}/api/lock/${year}/${newMonth}`;
    const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
    });
    if (!response.ok) {
        throw new Error('Failed verifying locked month');
    }
    return (await response.json()).isLocked;
}

export {
    getMonthWorkedHoursApiCall,
    createWorkedHoursApiCall,
    deleteWorkedHoursApiCall,
    updateWorkedHoursApiCall,
    lockMonthApiCall,
    verifyLockedMonthApiCall
};