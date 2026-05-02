import React, { useMemo } from 'react'
import { styles } from '../assets/dummyStyles';
import Navbar from './Navbar';
import Sidebar from "./Sidebar";
import { useState, useEffect } from 'react';
import { Car, Home, Utensils, ShoppingCart, Gift, Zap, Activity, ArrowUp, CreditCard, PiggyBank, IndianRupee, ArrowDown } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";
const CATEGORY_ICONS = {
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
    const now = new Date();
    const today = new Date(now).setHours(0, 0, 0, 0);

    switch (frame) {
        case "daily":
            return transactions.filter((t) => new Date(t.date) >= today);
        case "weekly": {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
            return transactions.filter((t) => new Date(t.date) >= startOfWeek);
        }
        case "monthly":
            return transactions.filter(
                (t) => new Date(t.date).getMonth() === now.getMonth()
            );
        default:
            return transactions;
    }
};

const safeArrayFromResponse = (res) => {
    const body = res?.data;
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
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
            setLoading(true);
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            const [incomeRes, expenseRes] = await Promise.all([
                axios.get(`${API_BASE}/income/get`, { headers }),
                axios.get(`${API_BASE}/expense/get`, { headers }),
            ]);

            const incomes = safeArrayFromResponse(incomeRes).map((i) => ({
                ...i,
                type: "income",
            }));
            const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
                ...e,
                type: "expense",
            }));

            const allTransactions = [...incomes, ...expenses]
                .map((t) => ({
                    id: t._id || t.id || t.id_str || Math.random().toString(36).slice(2),
                    description: t.description || t.title || t.note || "",
                    amount: t.amount != null ? Number(t.amount) : Number(t.value) || 0,
                    date: t.date || t.createdAt || new Date().toISOString(),
                    category: t.category || t.type || "Other",
                    type: t.type,
                    raw: t,
                }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(allTransactions);
            setLastUpdated(new Date());
        } catch (err) {
            console.error(
                "Failed to fetch transactions",
                err?.response || err.message || err
            );
        } finally {
            setLoading(false);
        }
    };

    //TO ADD TRANSACTIONS EITHER INCOME OR EXPENSE
    const addTransaction = async (transaction) => {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const endpoint =
                transaction.type === "income" ? "income/add" : "expense/add";
            await axios.post(`${API_BASE}/${endpoint}`, transaction, { headers });
            await fetchTransactions();
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
            await axios.put(`${API_BASE}/${endpoint}/${id}`, transaction, {  //put request to update transaction
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
            await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers });
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

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTransactions = useMemo( //To filter transactions with timeframes(daily, weekly, monthly)
        () => filterTransactions(transactions, timeFrame),
        [transactions, timeFrame]
    );

    //TO CALCULATE THE STATISTICS OF DATA BASED ON TIME
    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const last30DaysTransactions = transactions.filter(
            (t) => new Date(t.date) >= thirtyDaysAgo
        );

        const last30DaysIncome = last30DaysTransactions
            .filter((t) => t.type === "income")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const last30DaysExpenses = last30DaysTransactions
            .filter((t) => t.type === "expense")
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const allTimeIncome = transactions
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
                : 0;

        const last60DaysAgo = new Date(now);
        last60DaysAgo.setDate(now.getDate() - 60);

        const previous30DaysTransactions = transactions.filter((t) => {
            const date = new Date(t.date);
            return date >= last60DaysAgo && date < thirtyDaysAgo;
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
                )
                : 0;

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
        [timeFrame]
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

    //FOR FILTER EXPENSE BY DIFFERENT CATEGORIES
    const topCategories = useMemo(
        () =>
            Object.entries(
                transactions
                    .filter((t) => t.type === "expense")
                    .reduce((acc, t) => {
                        acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
                        return acc;
                    }, {})
            )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
        [transactions]
    );

    const displayedTransactions = showAllTransactions
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
                            <p className={styles.statCards.cardFooter}>
                                <span className=" text-teal-600 medium">
                                    +&#8377;{stats.last30DaysSavings.toLocaleString()}
                                </span> {" "} {/*giving some space */}
                                this month
                            </p>
                        </div>
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
                            <p className={styles.statCards.cardFooter}>
                                <span className=" text-green-600 medium">
                                    +12.5%
                                </span> {" "} {/*giving some space */}
                                from last month
                            </p>
                        </div>
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
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Layout