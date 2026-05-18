import { GoogleGenAI } from '@google/genai';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';

// Initialize Gemini Client
const ai = new GoogleGenAI({});

export const handleAIChat = async (req, res) => {
    try {
        const { message, history } = req.body;
        const userId = req.user._id; // Get logged-in user ID

        if (!message) {
            return res.status(400).json({ error: "Message content is required" });
        }

        // 1. FETCH USER DATA FOR THE CHATBOT
        // Chatbot ko bhi pichle 90 din ka context dena zaroori hai
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const [expenses, incomes] = await Promise.all([
            Expense.find({ userId: userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 }),
            Income.find({ userId: userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 })
        ]);

        // Format data so Gemini can easily parse and calculate
        const financialData = {
            expenses: expenses.map(e => ({ amount: e.amount, category: e.category, date: e.date, description: e.description })),
            incomes: incomes.map(i => ({ amount: i.amount, category: i.category, date: i.date, description: i.description }))
        };

        // 2. Format Chat History
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // 3. System Instructions with injected LIVE DATA
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: formattedHistory,
            config: {
                systemInstruction: `
          You are the highly sophisticated personal financial intelligence terminal for the platform "ExpenseIQ".
          Your function is to answer user queries dynamically regarding THEIR specific money management and transactions.
          
          CRITICAL DATA CONTEXT (User's last 90 days of transactions):
          ${JSON.stringify(financialData)}

          Operational Protocols:
          - ALWAYS calculate answers based on the 'CRITICAL DATA CONTEXT' provided above.
          - If the user asks "How much did I spend on food?", sum up the amounts where the category is 'Food' or 'Dining' from the JSON data and tell them the exact number.
          - DO NOT EVER say "I cannot answer that based on the dataset" or "refer to your dashboard". You have the data right here.
          - Keep responses exceptionally sharp, actionable, and concise (Strict limit of 2-3 short sentences).
          - Be friendly, professional, and explain complex things easily in plain English.
        `
            }
        });

        // 4. Send Message to Gemini
        const result = await chat.sendMessage({ message: message });

        return res.status(200).json({ text: result.text });

    } catch (error) {
        console.error("Gemini Chatbot Terminal Controller Error:", error);
        return res.status(500).json({
            error: "The chat terminal is currently experiencing network latency. Please query again."
        });
    }
};