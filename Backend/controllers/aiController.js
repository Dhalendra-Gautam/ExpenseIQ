import { GoogleGenAI } from '@google/genai';
import Expense from '../models/expenseModel.js';
import Income from '../models/incomeModel.js';

// Initialize Gemini Client
// It automatically picks up process.env.GEMINI_API_KEY from your .env file
const ai = new GoogleGenAI({});

export const getAIInsights = async (req, res) => {
    try {
        const userId = req.user._id; // Retrieved via your Auth middleware

        // Fetching the last 90 days of data to provide enough depth for pattern identification
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        // 1. Fetch data in parallel from both collections to minimize latency
        const [expenses, incomes] = await Promise.all([
            Expense.find({ userId: userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 }),
            Income.find({ userId: userId, date: { $gte: ninetyDaysAgo } }).sort({ date: -1 })
        ]);

        // Edge Case: If it is a completely new user with no financial history
        if (expenses.length === 0 && incomes.length === 0) {
            return res.status(200).json({
                summary: [
                    "Cannot generate AI Pulse right now due to insufficient data.",
                    "Please log your recent incomes and expenses to activate insights.",
                    "AI requires a few transactions to identify your spending patterns."
                ],
                prediction: {
                    expense: "₹0",
                    savings: "₹0",
                    trend: "Need more data to predict"
                },
                recommendations: [
                    {
                        title: "Data Required for Analysis",
                        desc: "AI cannot provide recommendations yet. Go to the dashboard and add your first transaction.",
                        level: "High Impact"
                    }
                ],
                healthScore: 0 // No data means 0 score, UI bar will stay empty which looks accurate
            });
        }

        // 2. Clean and structure the payload before sending it to Gemini
        const financialData = {
            totalExpensesRecords: expenses.length,
            totalIncomesRecords: incomes.length,
            expenses_history: expenses.map(e => ({
                amount: e.amount,
                category: e.category,
                description: e.description,
                date: e.date
            })),
            incomes_history: incomes.map(i => ({
                amount: i.amount,
                category: i.category,
                description: i.description,
                date: i.date
            }))
        };

        // 3. Strict English System Instructions forcing Gemini to output clear JSON
        const systemInstruction = `
      You are an elite financial strategist and data analyst operating as the AI core for the app "ExpenseIQ".
      You will evaluate a 90-day comprehensive historical dataset of the user's income and expense streams.
      
      Analyze recurring behaviors, category-wise spikes, weekend vs. weekday spending velocity, and cash leakages.
      
      Generate a single raw JSON object matching this exact architectural structure:
      {
        "summary": [
          "string (Max 3 data-driven, sharp, actionable insights in English regarding spending leakage, velocity comparison, or category spikes)"
        ],
        "prediction": {
          "expense": "string (Forecast the total expenditure for the current month based on the 90-day burn rate pace. Include currency symbol like ₹)",
          "savings": "string (Project the potential net savings left over by month-end based on active income lines minus forecasted expenses, with currency symbol)",
          "trend": "string (A concise 3-5 word definition of their timing or category trend, e.g., 'Elevated weekend recreational velocity' or 'Consistent fixed utility overhead')"
        },
        "recommendations": [
          { 
            "title": "string (A crisp action-oriented goal title, e.g., 'Consolidate Food Deliveries')", 
            "desc": "string (A 1-sentence advisory note explaining how to optimize this sector, written clearly in English)", 
            "level": "High Impact / Medium Impact / Smart Save" 
          }
        ],
        "healthScore": number (An integer value from 1 to 100 derived from calculating the savings-to-income ratio alongside bad spending flags)"
      }

      CRITICAL RESTRICTIONS:
      - Return ONLY the clean stringified JSON object.
      - Do NOT wrap your output inside markdown parameters (do not use \`\`\`json ... \`\`\`).
      - Do NOT include any introductory greetings, concluding remarks, or non-JSON strings.
    `;

        // 4. Dispatch payload to the fast and intelligent gemini-2.5-flash engine
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Here is the user's 90-day financial dataset: ${JSON.stringify(financialData)}`,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json" // Guarantees the API delivers structurally accurate JSON string
            }
        });

        // 5. Parse and return the direct JSON payload to your frontend layout
        const cleanJsonData = JSON.parse(response.text.trim());
        return res.status(200).json(cleanJsonData);

    } catch (error) {
        console.error("Gemini Insights Controller Error:", error);
        return res.status(500).json({
            error: "The AI analysis pipeline encountered an error processing the historical ledger. Please try again shortly."
        });
    }
};