import React, { useState, useEffect } from "react";
import Day from "./Day";
import CalendarToolbar from "./CalendarToolbar";
import { useTimeSheet } from "../../context/TimeSheetContext";
import { useTheme } from "../../context/ThemeContext";
import "./Calendar.css"
import DayDetail from "./DayDetail";
import AddWorkedHoursForm from "./AddWorkedHoursForm";
import EditWorkedHoursForm from "./EditWorkedHoursForm";


const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const createDate = (year, month, day) => {
    const date = new Date(year, month, day);
    return normalizeDate(date);
};

function Calendar() {
    const [selectedDay, setSelectedDay] = useState(() => normalizeDate(new Date()));
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editWorkedHours, setEditWorkedHours] = useState(null);
    const { isDarkMode } = useTheme();
    const { getMonthData, isMonthLocked, checkAndSetLockedMonth } = useTimeSheet();
    const [selectedMonth, setSelectedMonth] = useState(selectedDay.getMonth());
    const [selectedYear, setSelectedYear] = useState(selectedDay.getFullYear());

    const handleSetSelectedDay = (date) => {
        setSelectedDay(normalizeDate(date));
    };

    useEffect(() => {
        setSelectedMonth(selectedDay.getMonth());
        setSelectedYear(selectedDay.getFullYear());
    }, [selectedDay]);

    useEffect(() => {
        fetchMonthsData(selectedDay);
    }, [selectedMonth, selectedYear]);

    const isMonthLockedStatus = isMonthLocked(selectedDay.getFullYear(), selectedDay.getMonth());

    const handleClickAddForm = () => setShowAddForm(true);
    const handleCloseAddForm = () => setShowAddForm(false);
    const handleClickEditForm = (workedHours) => {
        setEditWorkedHours(workedHours);
        setShowEditForm(true);
    };
    const handleCloseEditForm = () => setShowEditForm(false);

    // Function to fetch data for a specific month, the previous and the next one
    const fetchMonthsData = async (date) => {
        const prevMonth = createDate(date.getFullYear(), date.getMonth() - 1, 1);
        const nextMonth = createDate(date.getFullYear(), date.getMonth() + 1, 1);

        const fetchPromises = [
            getMonthData(prevMonth.getFullYear(), prevMonth.getMonth()),
            checkAndSetLockedMonth(prevMonth.getFullYear(), prevMonth.getMonth()),
            getMonthData(date.getFullYear(), date.getMonth()),
            checkAndSetLockedMonth(date.getFullYear(), date.getMonth()),
            getMonthData(nextMonth.getFullYear(), nextMonth.getMonth()),
            checkAndSetLockedMonth(nextMonth.getFullYear(), nextMonth.getMonth())
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
        const date = createDate(selectedDay.getFullYear(), selectedDay.getMonth() - 1, daysInPrevMonth - i);
        week.push(date);
    }

    // Add current month's days
    for (let i = 0; i < daysInMonth; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        const date = createDate(selectedDay.getFullYear(), selectedDay.getMonth(), i + 1);
        week.push(date);
    }

    // Add next month's padding days
    for (let i = 0; i < nextMonthPadding; i++) {
        if (week.length === 7) {
            weeks.push(week);
            week = [];
        }
        const date = createDate(selectedDay.getFullYear(), selectedDay.getMonth() + 1, i + 1);
        week.push(date);
    }

    if (week.length > 0) {
        weeks.push(week);
    }

    return (
        <div className="container-md pt-3">
            <div className="row g-4">
                <div className="col-12">
                    <h2 className="display-6 text-capitalize mb-3 px-3 px-md-0">
                        {selectedDay.toLocaleString('default', { month: 'long' }) + ' ' + selectedDay.getFullYear()}
                    </h2>
                    <div className="px-3 px-md-0">
                        <CalendarToolbar 
                            setSelectedDay={handleSetSelectedDay} 
                            selectedDay={selectedDay} 
                            isMonthLocked={isMonthLockedStatus}
                        />
                    </div>
                </div>

                <div className="col-12">
                    <div className="px-3 px-md-0">
                        <DayDetail
                            handleClickAddForm={handleClickAddForm}
                            handleClickEditForm={handleClickEditForm}
                            date={selectedDay}
                        />
                    </div>
                </div>

                <div className="col-12">
                    <div className={`table-responsive rounded-3 shadow-sm ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
                        <table className={`table table-bordered m-0 ${isDarkMode ? 'table-dark' : ''}`} style={{ height: '800px' }}>
                            <thead>
                                <tr>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Sun</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Mon</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Tue</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Wed</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Thu</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Fri</th>
                                    <th className="text-center p-2 text-secondary text-uppercase small">Sat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, index) => (
                                    <tr key={index} style={{ height: '100px' }}>
                                        {week.map((date, dayIndex) => {
                                            const isPrevMonth = index === 0 && dayIndex < prevMonthPadding;
                                            const isNextMonth = index === weeks.length - 1 && dayIndex >= 7 - nextMonthPadding;
                                            const isPadded = isPrevMonth || isNextMonth;

                                            return (
                                                <td key={dayIndex} className={`p-0 ${isDarkMode ? 'border-secondary' : ''}`} style={{ width: '14.28%' }}>
                                                    <Day
                                                        date={date}
                                                        isPadded={isPadded}
                                                        setSelectedDay={handleSetSelectedDay}
                                                    />
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
                    onClose={handleCloseEditForm}
                />
            )}
        </div>
    );
}

export default Calendar;
