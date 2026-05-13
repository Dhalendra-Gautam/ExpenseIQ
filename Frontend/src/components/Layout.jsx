import React, { useMemo } from 'react' //hook to memorize calculated values so that they dont get recalculated on every render
import { styles } from '../assets/dummyStyles';
import Navbar from './Navbar';
import Sidebar from "./Sidebar";
import { useState, useEffect } from 'react';
import { Car, Home, Utensils, ShoppingCart, Gift, Zap, Activity, ArrowUp, CreditCard, PiggyBank, IndianRupee, ArrowDown, TrendingUp, Clock, RefreshCw, IndianRupeeIcon, Info, ChevronDown, PieChart } from 'lucide-react';
import axios from 'axios'; //for making api call to backend server for sending and receiving data
import { Outlet } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
const CATEGORY_ICONS = { //assigning icons based on category
    Food: <Utensils className="w-4 h-4" />,
    Housing: <Home className="w-4 h-4" />,
    Transport: <Car className="w-4 h-4" />,
    Shopping: <ShoppingCart className="w-4 h-4" />,
    Entertainment: <Gift className="w-4 h-4" />,
    Utilities: <Zap className="w-4 h-4" />,
    Healthcare: <Activity className="w-4 h-4" />,
    Salary: <ArrowUp className="w-4 h-4" />,
    Freelance: <CreditCard className="w-4 h-4" />,
    Savings: <PiggyBank className="w-4 h-4" />,
};

//TO FILTER TRANSACTIONS
const filterTransactions = (transactions, frame) => {
    const now = new Date(); //current date
    const today = new Date(now).setHours(0, 0, 0, 0); //current date without time

    switch (frame) {
        case "daily":
            return transactions.filter((t) => new Date(t.date) >= today); //(t) => new Date(t.date) >= today means for each trans. t, we converted date in trans. to date object and check if its is greater than or equal to today's date(12:00am of today)
        case "weekly": {
            const startOfWeek = new Date(today); //create a new date object with the same value as today (just copied)
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); //set the date to the start of the week (for eg. if today is 5th and it's wednesday, getDay() returns 3. So, 5-3=2. The date will be 2nd, which is start of the week)
            return transactions.filter((t) => new Date(t.date) >= startOfWeek); //same as daily but now with start of the week
        }
        case "monthly":
            return transactions.filter(
                (t) => new Date(t.date).getMonth() === now.getMonth() //for monthly, for each trans. t, we just check if the month of the trans. is same as the current month
            );
        default:
            return transactions;
    }
};

const safeArrayFromResponse = (res) => { //helper func to safely extract array from backend response
    const body = res?.data; //if res from server contains data, then store it in body, else return [] 
    if (!body) return []; // if body is empty, return empty array
    if (Array.isArray(body)) return body; //if body is array, return it
    if (Array.isArray(body.data)) return body.data; //if body.data is array, return it
    if (Array.isArray(body.incomes)) return body.incomes;
    if (Array.isArray(body.expenses)) return body.expenses;
    return [];
};

const Layout = ({ onLogout, user }) => {//the props  passed to Layout will be passed to Navbar component
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [timeFrame, setTimeFrame] = useState("monthly");
    const [loading, setLoading] = useState(false);
    const [showAllTransactions, setShowAllTransactions] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    //TO FETCH TRANSACTIONS FROM SERVER
    const fetchTransactions = async () => {
        try {
            setLoading(true); //while fetching, set loading to true
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {}; //for authenticated requests

            const [incomeRes, expenseRes] = await Promise.all([ //Promise.all allows to make multiple requests at same time (fetching both incomes and expenses at once)
                axios.get(`${API_BASE}/income/get`, { headers }), //axios.get(url,headers) sends GET request to url with headers
                axios.get(`${API_BASE}/expense/get`, { headers }),
            ]);

            const incomes = safeArrayFromResponse(incomeRes).map((i) => ({ //iterating over each income and adding type "income"
                ...i,
                type: "income",
            }));
            const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
                ...e,
                type: "expense",
            }));

            const allTransactions = [...incomes, ...expenses] //combining both incomes and expenses arrays
                .map((t) => ({ //.map is used to iterate over each element of an array and converting to same format
                    id: t._id || t.id || t.id_str || Math.random().toString(36).slice(2), //generates a unique id for each trans. If _id(from mongo db) is present, use it, else id(normal id), else id_str(string id), else random string
                    description: t.description || t.title || t.note || "", // extracts description from the trans(if description is not present, use title, if not title, use note, else empty string)
                    amount: t.amount != null ? Number(t.amount) : Number(t.value) || 0, // (if amount is not present, use value, else 0)
                    date: t.date || t.createdAt || new Date().toISOString(), // (if date is not present, use createdAt, else current date)
                    category: t.category || t.type || "Other", // (if category is not present, use type, else Other)
                    type: t.type,
                    raw: t, //stores the original transaction object 
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date)); //sorting in desc. order

            setTransactions(allTransactions);
            setLastUpdated(new Date()); //updates the last updated time
        } catch (err) {
            console.error(
                "Failed to fetch transactions",
                err?.response || err.message || err
            );
        } finally {
            setLoading(false); //when fetching is completed, set loading to false
        }
    };

    //TO ADD TRANSACTIONS EITHER INCOME OR EXPENSE
    const addTransaction = async (transaction) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint =
                transaction.type === "income" ? "income/add" : "expense/add";
            await axios.post(`${API_BASE}/${endpoint}`, transaction, { headers }); //axios.post(URL, DATA, CONFIG) here transaction is data
            await fetchTransactions(); //fetching transactions again to update the list
            return true;
        } catch (err) {
            console.error(
                "Failed to add transaction",
                err?.response || err.message || err
            );
            throw err;
        }
    };

    //TO UPDATE TRANSACTIONS EITHER INCOME OR EXPENSE
    const editTransaction = async (id, transaction) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint =
                transaction.type === "income" ? "income/update" : "expense/update";
            await axios.put(`${API_BASE}/${endpoint}/${id}`, transaction, {  //put request to update transaction(data)
                headers,
            });
            await fetchTransactions();
            return true;
        } catch (err) {
            console.error(
                "Failed to edit transaction",
                err?.response || err.message || err
            );
            throw err;
        }
    };

    //TO DELETE TRANSACTIONS EITHER INCOME OR EXPENSE
    const deleteTransaction = async (id, type) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint = type === "income" ? "income/delete" : "expense/delete";
            await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers }); //axios.delete(URL, CONFIG) here id is passed in URL
            await fetchTransactions();
            return true;
        } catch (err) {
            console.error(
                "Failed to delete transaction",
                err?.response || err.message || err
            );
            throw err;
        }
    };

    useEffect(() => { //it will run once when Layout Component loads
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo( //To filter transactions with timeframes(daily, weekly, monthly)
        () => filterTransactions(transactions, timeFrame),
        [transactions, timeFrame] //if transactions or timeFrame changes, recalculate filteredTransactions otherwise use calculated values (memoization)
    );

    //TO CALCULATE THE STATISTICS OF DATA BASED ON TIME
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now); //gets the current date
        thirtyDaysAgo.setDate(now.getDate() - 30); //subtracts 30 days from the current date 

        const last30DaysTransactions = transactions.filter(
            (t) => new Date(t.date) >= thirtyDaysAgo //each trans. date is compared with thirtyDaysAgo if true then included in the array
        );

        const last30DaysIncome = last30DaysTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0); //sum is initial value,t is current trans.,it adds each trans. amount to the sum and returns the final sum

        const last30DaysExpenses = last30DaysTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const allTimeIncome = transactions //transactions is the entire list of transactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const allTimeExpenses = transactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const savingsRate =
            last30DaysIncome > 0
                ? Math.round(
                    ((last30DaysIncome - last30DaysExpenses) / last30DaysIncome) * 100
                )
                : 0; //if last 30 days income is 0, savings rate is 0, else calculate it 

        const last60DaysAgo = new Date(now);
        last60DaysAgo.setDate(now.getDate() - 60);

        const previous30DaysTransactions = transactions.filter((t) => { //transactions = income, expenses both
            const date = new Date(t.date); //converts the date of the transaction to Date object
            return date >= last60DaysAgo && date < thirtyDaysAgo; //if trans lies in between 30-60 days ago (not including last 30 days trans ok) then included in the array
        });

        const previous30DaysExpenses = previous30DaysTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expenseChange =
            previous30DaysExpenses > 0
                ? Math.round(
                    ((last30DaysExpenses - previous30DaysExpenses) /
                        previous30DaysExpenses) *
                    100
                ) //calculates the percentage of change in expenses from previous 30 days to last 30 days
                : 0; //if previous 30 days expenses is 0, expense change is 0, else calculate it 

        return {
            totalTransactions: transactions.length,
            last30DaysIncome,
            last30DaysExpenses,
            last30DaysSavings: last30DaysIncome - last30DaysExpenses,
            allTimeIncome,
            allTimeExpenses,
            allTimeSavings: allTimeIncome - allTimeExpenses,
            last30DaysCount: last30DaysTransactions.length,
            savingsRate,
            expenseChange,
        };
    }, [transactions]);

    const timeFrameLabel = useMemo( //to get the label of the current timeframe e.g. today, this week, this month
        () =>
            timeFrame === "daily"
                ? "Today"
                : timeFrame === "weekly"
                    ? "This Week"
                    : "This Month",
        [timeFrame] //if timeFrame changes then recalculate timeFrameLabel otherwise use calculated values (memoization)
    );

    const outletContext = {
        transactions: filteredTransactions,
        addTransaction,
        editTransaction,
        deleteTransaction,
        refreshTransactions: fetchTransactions,
        timeFrame,
        setTimeFrame,
        lastUpdated,
    };

    const getSavingsRating = (rate) =>
        rate > 30 ? "Excellent" : rate > 20 ? "Good" : "Needs improvement";

    //TO FILTER TOP 5 CATEGORIES WHICH HAD HIGH EXPENSES
    const topCategories = useMemo( //when transaction changes then recalculate top categories otherwise use calculated values (memoization)
        () =>
            Object.entries( //converts the object of transactions into an array of [key,value] pairs
                transactions
                    .filter((t) => t.type === "expense") //filters transactions to only include expenses
                    .reduce((acc, t) => { //it will run each transaction and adds the amount of each transaction to its category
                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount); //acc is the accumulator, it adds the amount of each transaction to its category
                        return acc;
                    }, {}) //initial value of acc is an empty object
            )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
        [transactions]
    );

    const displayedTransactions = showAllTransactions //if showAllTransactions is true then display all transactions otherwise display only top 4 transactions
        ? transactions
        : transactions.slice(0, 4);

    return (
        <div className={styles.layout.root}>
            <Navbar user={user} onLogout={onLogout} /> {/*calling Navbar component and passing user and onLogout as props*/}
            <Sidebar user={user}
                isCollapsed={sidebarCollapsed}
                setIsCollapsed={setSidebarCollapsed}
            />
            <div className={styles.layout.mainContainer(sidebarCollapsed)}>
                <div className={styles.header.container}>
                    <div>
                        <h1 className={styles.header.title}>Dashboard</h1>
                        <p className={styles.header.subtitle}>Welcome back</p>
                    </div>
                </div>

                <div className={styles.statCards.grid}>
                    {/*CARD FOR TOTAL BALANCE */}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Total Balance</p>
                                <p className={styles.statCards.cardValue}>
                                    &#8377;
                                    {stats.allTimeSavings.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("teal")}>
                                <IndianRupee className={styles.statCards.icon("teal")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className=" text-teal-600 medium">
                                +&#8377;{stats.last30DaysSavings.toLocaleString()}
                            </span> {" "} {/*giving some space */}
                            this month
                        </p>
                    </div>

                    {/*CARD FOR MONTHLY INCOME*/}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Monthly Income</p>
                                <p className={styles.statCards.cardValue}>
                                    &#8377;
                                    {stats.last30DaysIncome.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("green")}>
                                <ArrowUp className={styles.statCards.icon("green")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className=" text-green-600 medium">
                                +12.5%
                            </span> {" "} {/*giving some space */}
                            from last month
                        </p>
                    </div>

                    {/*CARD FOR MONTHLY EXPENSES*/}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Monthly Expenses</p>
                                <p className={styles.statCards.cardValue}>
                                    &#8377;
                                    {stats.last30DaysExpenses.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("orange")}>
                                <ArrowDown className={styles.statCards.icon("orange")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            <span className={`${styles.colors.expenseChange(
                                stats.expenseChange
                            )} font- medium`}>
                                {stats.expenseChange > 0 ? "+" : ""}
                                {stats.expenseChange}%
                            </span> {" "} {/*giving some space */}
                            from last month
                        </p>
                    </div>

                    {/*SAVING RATE CARD */}
                    <div className={styles.statCards.card}>
                        <div className={styles.statCards.cardHeader}>
                            <div>
                                <p className={styles.statCards.cardTitle}>Saving Rate</p>
                                <p className={styles.statCards.cardValue}>
                                    &#8377;
                                    {stats.allTimeSavings.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            </div>
                            <div className={styles.statCards.iconContainer("blue")}>
                                <IndianRupee className={styles.statCards.icon("blue")} />
                            </div>
                        </div>
                        <p className={styles.statCards.cardFooter}>
                            {getSavingsRating(stats.savingsRate)}
                        </p>
                    </div>

                </div>
                <div className={styles.grid.main}>
                    <div className={styles.grid.leftColumn}>
                        <div className={styles.cards.base}>
                            <div className={styles.cards.header}>
                                <h3 className={styles.cards.title}>
                                    <TrendingUp className=' w-6 h-6 text-teal-500' />
                                    Financial Overview
                                    <span className=' text-sm text-gray-500 font-normal'>
                                        ({timeFrameLabel})
                                    </span>
                                </h3>
                            </div>
                            <Outlet context={outletContext} />
                        </div>
                    </div>
                    {/*Right Side*/}
                    <div className={styles.grid.rightColumn}>
                        <div className={styles.cards.base}>
                            <div className={styles.transactions.cardHeader}>
                                <h3 className={styles.transactions.cardTitle}>
                                    <Clock className='w-6 h-6 text-indigo-500' />
                                    Recent Transactions
                                </h3>
                                <button onClick={fetchTransactions} disabled={loading}
                                    className={styles.transactions.refreshButton}>
                                    <RefreshCw className={styles.transactions.refreshIcon(loading)} />
                                </button>
                            </div>

                            <div className={styles.transactions.dataStackingInfo}>
                                <Info className={styles.transactions.dataStackingIcon} />
                                <span>Transactions are stacked by date (newest first)</span>
                            </div>

                            <div className={styles.transactions.listContainer}>
                                {displayedTransactions.map((transaction) => {
                                    const { id, type, category, description, date, amount } = transaction;
                                    return (
                                        <div key={id} className={styles.transactions.transactionItem}>
                                            <div className="flex items-center gap-1 md:gap-4 lg:gap-3">
                                                <div className={`p-2 rounded-lg ${styles.colors.transaction.bg(type)}`}>
                                                    {CATEGORY_ICONS[category] || (
                                                        <IndianRupeeIcon className={styles.transactions.icon} />
                                                    )}
                                                </div>

                                                <div className={styles.transactions.details}>
                                                    <p className={styles.transactions.description}>
                                                        {description}
                                                    </p>

                                                    <p className={styles.transactions.meta}>
                                                        {new Date(date).toLocaleDateString()}
                                                        <span className=' ml-2 capitalize'>
                                                            {category}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={styles.colors.transaction.text(type)}>
                                                {type === "income" ? "+" : "-"} &#8377;{Number(amount)}
                                            </span>
                                        </div>
                                    );
                                })}

                                {transactions.length === 0 ? (
                                    <div className={styles.transactions.emptyState}>
                                        <div className={styles.transactions.emptyIconContainer}>
                                            <Clock className={styles.transactions.emptyIcon} />
                                        </div>
                                        <p className={styles.transactions.emptyText}>
                                            No recent transactions
                                        </p>
                                    </div>
                                ) : (
                                    <div className={styles.transactions.viewAllContainer}>
                                        <button onClick={() => setShowAllTransactions(!showAllTransactions)}
                                            className={styles.transactions.viewAllButton}
                                        >
                                            {showAllTransactions ? (
                                                <>
                                                    <ChevronDown className=' w-5 h-5' />
                                                    Show less
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className=' w-5 h-5' />
                                                    View all transactions ({transactions.length})
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/*SPENDING BY CATEGORY CARD */}
                        <div className={styles.cards.base}>
                            <h3 className={styles.cards.title}>
                                <PieChart className={styles.categories.titleIcon} />
                                Spending by Category
                            </h3>

                            <div className={styles.categories.list}>
                                {topCategories.map(([category, amount]) => (
                                    <div key={category} className={styles.categories.categoryItem}>
                                        <div className='flex items-center gap-3'>
                                            <div className={styles.categories.categoryIconContainer}>
                                                {CATEGORY_ICONS[category] || ( //CATEGORY_ICONS[category]  CATEGORY_ICONS is an object with keys as categories and values as icons || use default if category not found 
                                                    <IndianRupeeIcon className={styles.categories.categoryIcon} />
                                                )}
                                            </div>
                                            <span className={styles.categories.categoryName}>
                                                {category}
                                            </span>
                                        </div>
                                        <span className={styles.categories.categoryAmount}>
                                            &#8377;{amount}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.categories.summaryContainer}>
                                <div className={styles.categories.summaryGrid}>
                                    <div className={styles.categories.summaryIncomeCard}>
                                        <p className={styles.categories.summaryTitle}>
                                            Total Income
                                        </p>
                                        <p className={styles.categories.summaryValue}>
                                            &#8377;{stats.allTimeIncome.toLocaleString()}
                                        </p>
                                    </div>

                                    <div className={styles.categories.summaryExpenseCard}>
                                        <p className={styles.categories.summaryTitle}>
                                            Total Expenses
                                        </p>
                                        <p className={styles.categories.summaryValue}>
                                            &#8377;{stats.allTimeExpenses.toLocaleString()}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout