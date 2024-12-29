import React from "react";
import Day from "./Day";

function Calendar() {
    const days = Array.from({ length: 31 }, (_, index) => index);

    return (
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
    );
}

export default Calendar;
