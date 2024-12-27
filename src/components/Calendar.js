import React from "react";
import Day from "./Day";

function Calendar() {
    const days = Array.from({ length: 31 }, (_, index) => index);

    return (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                // width: "100%", // Ensure the calendar takes full width
                // margin: "0 auto", // Center the calendar if needed
            }}
        >
            {days.map((day) => (
                <Day key={day} dayNumber={day} />
            ))}
        </div>
    );
}

export default Calendar;
