import React, { useState } from "react";
import Day from "./Day";

function Calendar() {

    const [selectedDay, setSelectedDay] = useState(new Date());
    // day n. 0 of next month is the last day of the current month in JS
    const daysInMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    return (
        <div>
            <div>
                <p>{selectedDay.toLocaleDateString()}</p>
                <p>Days in {selectedDay.toLocaleDateString("default", { month: "long" })}: {daysInMonth}</p>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, 1))}>Previous Month</button>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 1))}>Next Month</button>
            </div>
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                }}
            >
                {days.map((day) => (
                    <Day key={day} dayNumber={day} />		
                ))}
            </div>
        </div>
    );
}

export default Calendar;
