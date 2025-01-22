import React, { useState, useEffect } from "react";
import Day from "./Day";
import CalendarToolbar from "./CalendarToolbar";
import { useTimeSheet } from "../../context/TimeSheetContext";
import "./Calendar.css"
import DayDetail from "./DayDetail";
import AddWorkedHoursForm from "./AddWorkedHoursForm";
import EditWorkedHoursForm from "./EditWorkedHoursForm";

function Calendar() {
    const [selectedDay, setSelectedDay] = useState(new Date());
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editWorkedHours, setEditWorkedHouts] = useState(null);

    // useEffect will trigger a the fetch of new data from the backend when the month of selectedDay changes 
    useEffect(() => {
        fetchMonthsData(selectedDay);
    }, [selectedDay.getMonth(), selectedDay.getFullYear()]);

    const { getMonthData } = useTimeSheet();


    const handleClickAddForm = () => setShowAddForm(true);
    const handleCloseAddForm = () => setShowAddForm(false);
    const handleClickEditForm = (workedHours) => {
        setEditWorkedHouts(workedHours);
        setShowEditForm(true);
    };
    const handleCloseEditForm = () => setShowEditForm(false);



    // Function to fetch data for a specific month, the previous and the next one
    const fetchMonthsData = async (date) => {
        const prevMonth = new Date(date.getFullYear(), date.getMonth(), 0);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        const fetchPromises = [
            getMonthData(prevMonth.getFullYear(), prevMonth.getMonth()),
            getMonthData(date.getFullYear(), date.getMonth()),
            getMonthData(nextMonth.getFullYear(), nextMonth.getMonth())
        ];

        await Promise.all(fetchPromises);
    };

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
            <div className="row mb-3">
                <div className="col-12">
                    <h2 className="text-capitalize mb-3">
                        {selectedDay.toLocaleString('default', { month: 'long' }) + ' ' + selectedDay.getFullYear()}
                    </h2>
                    <CalendarToolbar setSelectedDay={setSelectedDay} selectedDay={selectedDay} />
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-12">
                    <DayDetail
                        handleClickAddForm={handleClickAddForm}
                        handleClickEditForm={handleClickEditForm}
                        date={selectedDay} />
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="table-responsive">
                        <table className="table table-bordered mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-center p-1">Sun</th>
                                    <th className="text-center p-1">Mon</th>
                                    <th className="text-center p-1">Tue</th>
                                    <th className="text-center p-1">Wed</th>
                                    <th className="text-center p-1">Thu</th>
                                    <th className="text-center p-1">Fri</th>
                                    <th className="text-center p-1">Sat</th>
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
                                                <td key={dayIndex} className="p-0" style={{ height: '120px' }}>
                                                    <Day date={date} isPadded={isPadded} setSelectedDay={setSelectedDay} />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {showAddForm && (
                <AddWorkedHoursForm
                    date={selectedDay}
                    onClose={handleCloseAddForm}
                />
            )}
            {showEditForm && (
                <EditWorkedHoursForm
                    workedHours={editWorkedHours}
                    onClose={handleCloseEditForm} />
            )}
        </div>
    );
}

export default Calendar;
