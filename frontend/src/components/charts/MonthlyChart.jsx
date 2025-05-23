import React, { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { useTheme } from "../../context/ThemeContext";
import { useTimeSheet } from "../../context/TimeSheetContext";

const MonthlyChart = () => {
    const { isDarkMode } = useTheme();
    const { getDayData, getMonthData, getSelectedDay } = useTimeSheet();
    const [isLoading, setIsLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState({});
    const isMounted = useRef(true);

    const selectedMonth = getSelectedDay();
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const chartData = [];
    let hasExistingData = false;

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const entries = getDayData(currentDate);

        if (entries.length > 0) {
            hasExistingData = true;
        }

        // Only include days that are not weekends, unless they have hours recorded
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

    // Fetch data for the selected month when component mounts or selectedMonth changes
    useEffect(() => {
        // Set up cleanup function to prevent state updates after unmount
        isMounted.current = true;
        
        const fetchMonthData = async () => {
            const monthKey = `${year}-${month}`;
            // Only fetch if we don't already have data and haven't tried fetching for this month
            if (!hasExistingData && !hasFetched[monthKey]) {
                setIsLoading(true);
                try {
                    await getMonthData(year, month);
                    if (isMounted.current) {
                        setHasFetched(prev => ({
                            ...prev,
                            [monthKey]: true
                        }));
                    }
                } catch (error) {
                    if (isMounted.current) {
                        console.error('Error fetching month data:', error);
                    }
                } finally {
                    if (isMounted.current) {
                        setIsLoading(false);
                    }
                }
            }
        };

        fetchMonthData();

        // Cleanup function to prevent state updates after unmount
        return () => {
            isMounted.current = false;
        };
    }, [year, month, getMonthData, hasExistingData]);

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

    const hasRecordedHours = chartData.some(day => day.totalHours > 0);

    // Calculate the maximum total hours recorded
    const maxHours = chartData.length > 0 ? Math.max(...chartData.map(day => day.totalHours)) : 0;

    // Setup the Y-axis domain and ticks
    const yAxisDomain = [10, maxHours > 10 ? maxHours : 10]; // Minimum 10, maximum based on data
    const ticks = [2, 4, 6, 8];
    for (let i = 10; i <= yAxisDomain[1]; i += 2) {
        ticks.push(i);
    }

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <p>Loading data for {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}...</p>
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (chartData.length === 0 || !hasRecordedHours) {
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
                    <p className="lead mb-4">
                        Look at your work hours for the month of <span className="text-capitalize">{selectedMonth.toLocaleString('default', { month: 'long' })}</span> {selectedMonth.getFullYear()}.
                    </p>
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
                            domain={yAxisDomain}
                            ticks={ticks}
                        />

                        <ReferenceLine y={8} stroke="red" strokeDasharray="5 5" />
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
