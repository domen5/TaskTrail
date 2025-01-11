import React, { useState } from "react";
import Day from "./Day";
import CalendarToolbar from "./CalendarToolbar";

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
    const daysInPrevMonth = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), 0).getDate();
    for (let i = prevMonthPadding - 1; i >= 0; i--) {
        const date = new Date(selectedDay.getFullYear(), selectedDay.getMonth() - 1, daysInPrevMonth - i);
        week.push(date);
    }

    // Add current month's days
    for (let i = 0; i < daysInMonth; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        const date = new Date(selectedDay.getFullYear(), selectedDay.getMonth(), i + 1);
        week.push(date);
    }

    // Add next month's padding days
    for (let i = 0; i < nextMonthPadding; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        const date = new Date(selectedDay.getFullYear(), selectedDay.getMonth() + 1, i + 1);
        week.push(date);
    }

    if (week.length > 0) {
        weeks.push(week);
    }

    return (
        <div className="container">
            <div className="row">
                <h2 style={{ textTransform: "capitalize" }}>
                    {selectedDay.toLocaleString('default', { month: 'long' }) + ' ' + selectedDay.getFullYear()}
                </h2>
                <CalendarToolbar setSelectedDay={setSelectedDay} selectedDay={selectedDay} />
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
                            {week.map((date, dayIndex) => {
                                const isPrevMonth = index === 0 && dayIndex < prevMonthPadding;
                                const isNextMonth = index === weeks.length - 1 && dayIndex >= 7 - nextMonthPadding;
                                const isPadded = isPrevMonth || isNextMonth;

                                return (
                                    <td key={dayIndex}>
                                        <Day date={date} isPadded={isPadded} />
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