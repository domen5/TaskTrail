// Get month data from the backend; Assumes 0 based months
const fetchMonthData = async (year, month) => {
    const newMonth = month + 1; // Backend API expects 1-based months
    const url = `http://localhost:3000/api/worked-hours/${year}/${newMonth}`;

    try {
        const response = await fetch(url);
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
                    acc[item.date] = [];  // Initialize an empty array if not present
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