//HELPER FUNCTIONS WHICH HELP IN FILTERING THE DATA
export const getTimeFrameRange = (timeFrame) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (timeFrame === "daily") {
        return { start, end: new Date(now), label: "Today" };
    }

    if (timeFrame === "weekly") {
        const startOfWeek = new Date(start);
        startOfWeek.setDate(start.getDate() - start.getDay()); //if today is wednesday(3) then it will subtract 3 and get the Monday from date to get date of week start. setdate() udates it
        startOfWeek.setHours(0, 0, 0, 0);
        return { start: startOfWeek, end: new Date(now), label: "This Week" };
    }

    if (timeFrame === "monthly") {
        const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        return { start: startOfMonth, end: new Date(now), label: "This Month" };
    }

    // yearly
    if (timeFrame === "yearly") {
        const startOfYear = new Date(start.getFullYear(), 0, 1); //0 means jan, 1 jan. 
        startOfYear.setHours(0, 0, 0, 0);
        return { start: startOfYear, end: new Date(now), label: "This Year" };
    }

    // default -> monthly
    const startOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    return { start: startOfMonth, end: new Date(now), label: "This Month" };
}; // to filter according to day, month, year

export const getPreviousTimeFrameRange = (timeFrame) => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (timeFrame === "daily") {
        const yesterday = new Date(start);
        yesterday.setDate(start.getDate() - 1); //to get yesterday's date
        const end = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            23,
            59,
            59,
            999
        );
        return {
            start: yesterday,
            end,
            label: "Yesterday",
        };
    }

    if (timeFrame === "weekly") {
        const startOfLastWeek = new Date(start);
        startOfLastWeek.setDate(start.getDate() - start.getDay() - 7); //to get last week's start date
        startOfLastWeek.setHours(0, 0, 0, 0);
        const endOfLastWeek = new Date(startOfLastWeek);
        endOfLastWeek.setDate(startOfLastWeek.getDate() + 6); //to get last week's end date
        endOfLastWeek.setHours(23, 59, 59, 999);
        return { start: startOfLastWeek, end: endOfLastWeek, label: "Last Week" };
    }

    if (timeFrame === "monthly") {
        const startOfLastMonth = new Date(
            start.getFullYear(),
            start.getMonth() - 1,
            1
        );
        startOfLastMonth.setHours(0, 0, 0, 0);
        const endOfLastMonth = new Date(start.getFullYear(), start.getMonth(), 0);
        endOfLastMonth.setHours(23, 59, 59, 999);
        return {
            start: startOfLastMonth,
            end: endOfLastMonth,
            label: "Last Month",
        };
    }

    if (timeFrame === "yearly") {
        const startOfLastYear = new Date(start.getFullYear() - 1, 0, 1); //2026-1 = 2025 , 1 jan 2025
        startOfLastYear.setHours(0, 0, 0, 0);
        const endOfLastYear = new Date(
            start.getFullYear() - 1,
            11, //december
            31, //31st dec
            23, //last millisecond of the day 23:59:59:999
            59,
            59,
            999
        );
        return { start: startOfLastYear, end: endOfLastYear, label: "Last Year" };
    }

    // default -> last month
    const startOfLastMonth = new Date(
        start.getFullYear(),
        start.getMonth() - 1, //May-1 = april
        1 //1st April
    );
    startOfLastMonth.setHours(0, 0, 0, 0); //start of the day
    const endOfLastMonth = new Date(start.getFullYear(), start.getMonth(), 0); //last day of previous month
    endOfLastMonth.setHours(23, 59, 59, 999); //last millisecond of the day
    return { start: startOfLastMonth, end: endOfLastMonth, label: "Last Month" };
};

export const calculateData = (transactions) => {
    const totals = transactions.reduce( //reduce is used to iterate over the array and accumulate a single value
        (data, t) => {
            const amt = Number(t.amount) || 0;
            if (t.type === "income") {
                data.income += amt;
            } else {
                data.expenses += amt;
            }
            return data;
        },
        { income: 0, expenses: 0 }
    );

    return { ...totals, savings: totals.income - totals.expenses };
};

export const generateChartPoints = (timeFrame) => {
    const now = new Date();
    const points = [];

    if (timeFrame === "daily") {
        // Generate 24 hours for daily view
        for (let i = 0; i < 24; i++) {
            const hour = new Date(now);
            hour.setHours(i, 0, 0, 0); //setting time to i hour , 0 minutes , 0 seconds , 0 milliseconds
            points.push({
                date: hour,
                label: hour.toLocaleTimeString([], { hour: "2-digit" }), //to get the time in 2-digit format like 01,02 etc
                hour: i,
                isCurrent: i === now.getHours(), //to check if the current hour is same as the hour of the point
            });
        }
    } else if (timeFrame === "weekly") {
        // Generate 7 days for weekly view (Sunday -> Saturday)
        const start = new Date(now);
        start.setDate(now.getDate() - now.getDay()); //todays date - weekday number e.g. 15-3 = 12
        start.setHours(0, 0, 0, 0);

        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            points.push({
                date: day,
                label: day.toLocaleDateString("en-US", { weekday: "short" }),
                isCurrent:
                    day.getDate() === now.getDate() && day.getMonth() === now.getMonth(),
            });
        }
    } else if (timeFrame === "monthly") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        ).getDate(); //to get the number of days in a month (2026, 4+1 = 5(june). 0 = 31st may(last day of may 0th day of june))

        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(now.getFullYear(), now.getMonth(), i);
            points.push({
                date: day,
                label: day.toLocaleDateString("en-US", { day: "numeric" }),
                isCurrent: i === now.getDate(),
            });
        }
    } else if (timeFrame === "yearly") {
        for (let i = 0; i < 12; i++) {
            const month = new Date(now.getFullYear(), i, 1);
            points.push({
                date: month,
                label: month.toLocaleDateString("en-US", { month: "short" }),
                isCurrent: i === now.getMonth(),
            });
        }
    } else {
        // fallback -> monthly //if no valid timeframe provided then use monthly data
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        ).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(now.getFullYear(), now.getMonth(), i);
            points.push({
                date: day,
                label: day.toLocaleDateString("en-US", { day: "numeric" }),
                isCurrent: i === now.getDate(),
            });
        }
    }

    return points;
};