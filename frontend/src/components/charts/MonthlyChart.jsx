import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useTimeSheet } from "../../context/TimeSheetContext";

const MonthlyChart = ({ selectedMonth = new Date() }) => {
    const { isDarkMode } = useTheme();
    const { getDayData } = useTimeSheet();

    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const chartData = [];

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const entries = getDayData(currentDate);

        if (entries.length > 0 || currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

            const overtimeHours = entries
                .filter(entry => entry.overtime)
                .reduce((sum, entry) => sum + entry.hours, 0);

            const regularHours = totalHours - overtimeHours;

            const formattedDate = currentDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric'
            });

            chartData.push({
                date: formattedDate,
                day,
                totalHours,
                regularHours,
                overtimeHours
            });
        }
    }

    chartData.sort((a, b) => a.day - b.day);

    // Custom tooltip to display more detailed information
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className={`custom-tooltip p-2 ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`} style={{ border: '1px solid #ccc', borderRadius: '4px' }}>
                    <p className="mb-1"><strong>{label}</strong></p>
                    <p className="mb-1">Total: {payload[0].value.toFixed(1)} hours</p>
                    {payload[1] && <p className="mb-1">Regular: {payload[1].value.toFixed(1)} hours</p>}
                    {payload[2] && <p className="mb-0">Overtime: {payload[2].value.toFixed(1)} hours</p>}
                </div>
            );
        }
        return null;
    };

    if (chartData.length === 0) {
        return (
            <div className="text-center p-4">
                <p>No data available for {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}.</p>
            </div>
        );
    }

    const textColor = isDarkMode ? "#fff" : "#333";
    const gridColor = isDarkMode ? "#555" : "#ccc";
    const regularHoursColor = "green";
    const overtimeHoursColor = "orange";

    return (
        <div className="monthly-chart">
            <div className={`container-md text-center ${isDarkMode ? 'text-white' : 'text-dark'}`}>
                <div className="text-center py-3">
                    <h1 className="display-3 fw-bold mb-4"><i className="fas fa-chart-column me-2"></i>Monthly Worked Hours</h1>
                    <p className="lead mb-4">Look at your work hours for the month of {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis
                            dataKey="date"
                            stroke={textColor}
                        />
                        <YAxis
                            stroke={textColor}
                            label={{
                                value: 'Hours',
                                angle: -90,
                                position: 'insideLeft',
                                style: { textAnchor: 'middle', fill: textColor }
                            }}
                        />
                        {/* TODO: thinner cursor instead of disabled */}
                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={false}
                        />
                        <Legend />
                        <Bar
                            dataKey="regularHours"
                            name="Regular Hours"
                            fill={regularHoursColor}
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="overtimeHours"
                            name="Overtime Hours"
                            fill={overtimeHoursColor}
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MonthlyChart;
