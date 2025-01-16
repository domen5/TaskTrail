import { createKey } from "../utils/utils";

// Get month data from the backend; Assumes 0 based months
const fetchMonthData = async (year, month) => {
    const newMonth = month + 1; // Backend api expects  1-based months
    const url = `http://localhost:3000/api/worked-hours/${year}/${newMonth}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch month data from backend');
    }
    const data = await response.json();
    return data;
};

const postDayData = async (date, formData) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const url = `http://localhost:3000/api/worked-hours/${year}/${month}/${day}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workedHours: formData
        })
    });
    if (!response.ok) {
        throw new Error('Failed post day data to backend');
    }
    const data = await response.json();
    return data;

};

export { fetchMonthData, postDayData };