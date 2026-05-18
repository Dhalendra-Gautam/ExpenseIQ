import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client (picks key from process.env.GEMINI_API_KEY)
const ai = new GoogleGenAI({});

export const handleAIChat = async (req, res) => {
    try {
        const { message, history } = req.body; // Incoming current message and history array from frontend

        if (!message) {
            return res.status(400).json({ error: "Message content is required" });
        }

        // 1. Format the frontend state array into the roles expected by Gemini ('user' and 'model')
        const formattedHistory = (history || []).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        // 2. Initialize a conversational session with embedded historical memory context
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: formattedHistory,
            config: {
                systemInstruction: `
          You are the highly sophisticated personal financial intelligence terminal for the platform "ExpenseIQ".
          Your function is to answer user queries dynamically regarding wealth management, micro-budgeting setups, and automated savings tactics.
          
          Operational Protocols:
          - Keep responses exceptionally sharp, actionable, and concise (Strict limit of 2-3 short sentences).
          - Maintain a professional, supportive, and elite financial analyst tone.
          - Speak strictly in clear, natural English. Do not use slang or code blocks unless explicitly requested.
        `
            }
        });

        // 3. Dispatch the current text node into the context engine
        const result = await chat.sendMessage({ message: message });

        // 4. Return the calculated text block back to the UI layout wrapper
        return res.status(200).json({ text: result.text });

    } catch (error) {
        console.error("Gemini Chatbot Terminal Controller Error:", error);
        return res.status(500).json({
            error: "The chat terminal is currently experiencing network latency. Please query again."
        });
    }
};