import React, { useState } from "react";
import Day from "./Day";

function Calendar() {
    const [selectedDay, setSelectedDay] = useState(new Date());
    const daysInMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0).getDate();

    const firstDayOfMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 1).getDay();
    const prevMonthPadding = firstDayOfMonth;
    const lastDayOfMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 0).getDay();
    const nextMonthPadding = 6 - lastDayOfMonth;

    const weeks = [];
    let week = [];

    // Add previous month's padding days
    for (let i = 0; i < prevMonthPadding; i++) {
        week.push(new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, daysInMonth - i).getDate());
    }

    // Add current month's days
    for (let i = 0; i < daysInMonth; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        week.push(i + 1);
    }

    // Add next month's padding days
    for (let i = 0; i < nextMonthPadding; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        week.push(i + 1);
    }

    if (week.length > 0) {
        weeks.push(week);
    }

    return (
        <div>
            <div>
                <p>{selectedDay.toLocaleDateString()}</p>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, 1))}>Previous Month</button>
                <button onClick={() => setSelectedDay(new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, 1))}>Next Month</button>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Sun</th>
                        <th>Mon</th>
                        <th>Tue</th>
                        <th>Wed</th>
                        <th>Thu</th>
                        <th>Fri</th>
                        <th>Sat</th>
                    </tr>
                </thead>
                <tbody>
                    {weeks.map((week, index) => (
                        <tr key={index}>
                            {week.map((day, dayIndex) => {
                                const isPrevMonth = index === 0 && dayIndex < prevMonthPadding;
                                const isNextMonth = index === weeks.length - 1 && dayIndex >= 7 - nextMonthPadding;
                                const isPadded = isPrevMonth || isNextMonth;

                                return (
                                    <td key={dayIndex}>
                                        <Day dayNumber={day} isPadded={isPadded} />
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Calendar;
