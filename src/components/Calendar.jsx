import React, { useState } from "react";
import Day from "./Day";

function Calendar() {

    const [selectedDay, setSelectedDay] = useState(new Date());
    // day n. 0 of next month is the last day of the current month in JS
    const daysInMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    const firstDayOfMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1).getDay();
    const prevMonthPadding = 6 - firstDayOfMonth;

    const lastDayOfMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0).getDay();

    const nextMonthPadding = 6 - lastDayOfMonth;
    const weeks = [];
    let week = [];

    for (let i = 0; i < prevMonthPadding; i++) {
        week.push(new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, daysInMonth - i).getDate());
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    for (let i = 0; i < daysInMonth; i++) {
        week.push(new Date(selectedDay.getFullYear(), selectedDay.getMonth(), i + 1).getDate());
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    for (let i = 0; i < nextMonthPadding; i++) {
        week.push(new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, i + 1).getDate());
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
    }
    if (week.length > 0) {
        weeks.push(week);
    }

    for (let week of weeks) {
        console.log(week);
    }


    return (
        <div>
            <div>
                <p>{selectedDay.toLocaleDateString()}</p>
                <p>Days in {selectedDay.toLocaleDateString("default", { month: "long" })}: {daysInMonth}</p>
                <p>First day of month: {firstDayOfMonth}</p>
                <p>Prev month padding: {prevMonthPadding}</p>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, 1))}>Previous Month</button>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 1))}>Next Month</button>
            </div>
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Sun</th>
                            <th scope="col">Mon</th>
                            <th scope="col">Tue</th>
                            <th scope="col">Wed</th>
                            <th scope="col">Thu</th>
                            <th scope="col">Fri</th>
                            <th scope="col">Sat</th>
                        </tr>
                    </thead>
                    <tbody>
                        {weeks.map((week, index) => (
                            <tr key={index}>
                                {week.map((day, index) => (
                                    <td>
                                        <div style={{ display: "flex", flexWrap: "wrap", }}>
                                            <Day key={index} dayNumber={day} />
                                        </div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
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
