import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";

//ADD EXPENSE
export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;
    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        });
        await newExpense.save();
        res.json({
            success: true,
            message: "Expense added successfully"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//GET ALL EXPENSES
export async function getAllExpense(req, res) {
    const userId = req.user._id;
    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json({ expenses });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//UPDATE AN EXPENSE
export async function updateExpense(req, res) {
    const { id } = req.params;
    const { description, amount } = req.body;
    if (!id || !description || !amount) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }
    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );
        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Expense updated successfully",
            data: updatedExpense
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//DELETE AN EXPENSE
export async function deleteExpense(req, res) {
    const { id } = req.params;
    try {
        const expense = await expenseModel.findByIdAndDelete({ _id: id });
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Income deleted successfully"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//TO DOWNLOAD EXPENSES IN EXCEL SHEET
export async function downloadExpenseExcel(req, res) {
    const userId = req.user._id;
    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        const plainData = expense.map((exp) => { //looping through all incomes in DB and storing in array of objects
            return {
                Description: exp.description,
                Amount: exp.amount,
                Category: exp.category,
                Date: new Date(exp.date).toLocaleDateString()
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(plainData); //converts array of objects to excel worksheet format
        const workbook = XLSX.utils.book_new(); //creates a new workbook(excel file) where we store sheets
        XLSX.utils.book_append_sheet(workbook, worksheet, "ExpenseModel"); //appends the worksheet to the workbook
        XLSX.writeFile(workbook, "expense_details.xlsx"); //saving the file in server memory for download
        res.download("expense_details.xlsx"); //sends the file to the client for download
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}

//TO GET EXPENSE OVERVIEW
export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range); //it calculates start and end date according to range
        const expenses = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end }
        }).sort({ date: -1 }); //sorts the incomes in descending order of date

        const totalExpense = expenses.reduce((acc, cur) => acc + cur.amount, 0); //reduce method finds the total income by adding all incomes
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0; //finds the average income by dividing total income by number of incomes
        const numberOfTransactions = expenses.length;
        const recentTransactions = expenses.slice(0, 5); //it gives first 9 recent transactions

        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
}