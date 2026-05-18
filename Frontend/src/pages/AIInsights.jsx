import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles, ArrowUpRight, Lightbulb, Send, RefreshCw,
    Bot, TrendingUp, ShieldCheck, Zap, User, Loader2
} from 'lucide-react';
import { dashboardStyles } from '../assets/dummyStyles';

// Adjust this URL placeholder to match your global configuration if necessary
const BASE_URL = import.meta.env.VITE_API_URL;

const AIInsights = () => {
    const [aiData, setAiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatInput, setChatInput] = useState("");
    const [chatLoading, setChatLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: 'Hello! I am your ExpenseIQ AI financial advisor. I have thoroughly evaluated your ledger streams. How can I assist you with your asset optimizations today?' }
    ]);

    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, chatLoading]);

    // Fetch live 90-day analytics from the backend with Caching Logic
    const fetchAIInsights = async (forceRefresh = false) => {
        setLoading(true);
        try {
            // CACHE LOGIC: Agar forceRefresh false hai, check LocalStorage first
            if (!forceRefresh) {
                const cachedInsights = localStorage.getItem('expenseIQ_ai_cache');
                if (cachedInsights) {
                    setAiData(JSON.parse(cachedInsights));
                    setLoading(false);
                    return; // Cache found, skip the API call!
                }
            }

            const token = localStorage.getItem('token'); // Retrieve your stored JWT auth token
            const response = await fetch(`${BASE_URL}/ai/insights`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                setAiData(data);
                // CACHE LOGIC: Save the fresh data to LocalStorage for future visits
                localStorage.setItem('expenseIQ_ai_cache', JSON.stringify(data));
            } else {
                console.error("Failed to fetch insights:", data.error);
            }
        } catch (error) {
            console.error("Network error fetching AI insights:", error);
        } finally {
            setLoading(false);
        }
    };

    // Load initial configuration insights on component load (defaults to false -> uses cache if available)
    useEffect(() => {
        fetchAIInsights();
    }, []);

    // Send chat messages to the continuous Gemini context model
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || chatLoading) return;

        const userMessage = { sender: 'user', text: chatInput };
        const updatedMessages = [...chatMessages, userMessage];

        setChatMessages(updatedMessages);
        setChatInput("");
        setChatLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: chatMessages // Pass whole chat history state to maintain conversational memory
                })
            });
            const data = await response.json();

            if (response.ok) {
                setChatMessages(prev => [...prev, { sender: 'ai', text: data.text }]);
            } else {
                setChatMessages(prev => [...prev, { sender: 'ai', text: "I encountered an operational issue. Please try resending your message." }]);
            }
        } catch (error) {
            console.error("Chat routing error:", error);
            setChatMessages(prev => [...prev, { sender: 'ai', text: "Connection latency detected. Please check your server connectivity." }]);
        } finally {
            setChatLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">

            {/* 1. Header Section */}
            <div className={`${dashboardStyles.headerContainer} shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-500`}>
                <div className={dashboardStyles.headerContent}>
                    <div>
                        <h1 className={`${dashboardStyles.headerTitle} flex items-center gap-3`}>
                            <div className="bg-[#63b015]/20 p-2 rounded-xl">
                                <Sparkles className="text-[#63b015] w-6 h-6" />
                            </div>
                            AI Insights
                        </h1>
                        <p className={`${dashboardStyles.headerSubtitle} ml-1`}>AI-powered predictions and financial health tracking.</p>
                    </div>
                    {/* BUTTON UPDATED: Passes `true` to force an API call and refresh cache */}
                    <button
                        onClick={() => fetchAIInsights(true)}
                        disabled={loading}
                        className={`${dashboardStyles.addButton} disabled:opacity-50 flex items-center gap-2`}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Analyzing...' : 'Re-Analyze'}
                    </button>
                </div>
            </div>

            {/* Global Loader Skeleton Layer */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="animate-spin text-[#63b015]" size={40} />
                    <p className="text-gray-500 text-sm font-medium tracking-wide">ExpenseIQ engine is scanning your 90-day transactions...</p>
                </div>
            ) : (
                <>
                    {/* 2. Top Summary & Prediction Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                        {/* Quick AI Pulse (Left) */}
                        <div className="xl:col-span-7 bg-white rounded-3xl p-6 md:p-8 text-gray-800 relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[#63b015]">
                                <Zap size={120} strokeWidth={1} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-2 text-[#63b015] font-bold tracking-widest text-xs md:text-sm uppercase">
                                    <Zap size={14} fill="currentColor" /> Quick AI Pulse
                                </div>
                                <div className="space-y-4 md:space-y-5 mt-6">
                                    {aiData?.summary?.map((text, i) => (
                                        <div key={i} className="flex items-start gap-4 group">
                                            <div className="h-8 w-8 rounded-full bg-[#eef8e7] flex items-center justify-center text-[#63b015] shrink-0 group-hover:bg-[#63b015] group-hover:text-white transition-all duration-300">
                                                <TrendingUp size={14} />
                                            </div>
                                            <p className="text-base md:text-lg font-medium text-gray-700 leading-relaxed">{text}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Financial Health Score (Right) */}
                        <div className="xl:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Financial Health</h3>
                                <ShieldCheck className="text-[#63b015]" size={20} />
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl md:text-5xl font-black text-gray-800">{aiData?.healthScore ?? 0}</span>
                                <span className="text-lg md:text-xl text-gray-400 font-bold">/100</span>
                            </div>
                            <div className="w-full bg-gray-100 h-4 rounded-full mt-6 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-[#7acb1f] to-[#63b015] h-full rounded-full transition-all duration-1000"
                                    style={{ width: `${aiData?.healthScore ?? 0}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-500 text-sm mt-4 font-medium italic">
                                {aiData?.healthScore > 75 ? '"Excellent: Your capital accumulation structure looks highly efficient."' : '"Stable: Analyze targeted areas to increase your net velocity margins."'}
                            </p>
                        </div>
                    </div>

                    {/* 3. Prediction & Recommendation Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-[repeat(auto-fit,minmax(min(100%,450px),1fr))] gap-6 md:gap-8">

                        {/* Spending Prediction */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            <h3 className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest mb-6">
                                Spending Prediction 📈
                            </h3>

                            <div className="flex-1 flex flex-col justify-center gap-6">
                                <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 text-center flex flex-col justify-center w-full">
                                    <p className="text-sm md:text-base text-gray-500 mb-2 font-medium">Estimated Total for this Month</p>
                                    <p className="text-4xl md:text-5xl font-black text-gray-800 tracking-tight">{aiData?.prediction?.expense}</p>
                                </div>

                                <div className="flex flex-col xl:flex-row gap-4 w-full">
                                    <div className="bg-eef8e7 p-4 md:p-5 rounded-2xl border border-[#63b015]/20 flex-1 flex flex-col items-center justify-center text-center bg-[#eef8e7]">
                                        <p className="text-xs text-[#63b015] font-bold mb-1 uppercase tracking-wider whitespace-nowrap">Potential Savings</p>
                                        <p className="text-xl md:text-2xl font-black text-[#63b015]">{aiData?.prediction?.savings}</p>
                                    </div>
                                    <div className="bg-orange-50 p-4 md:p-5 rounded-2xl border border-orange-100 flex-1 flex flex-col items-center justify-center text-center">
                                        <p className="text-xs text-orange-600 font-bold mb-1 uppercase tracking-wider whitespace-nowrap">Spending Trend</p>
                                        <p className="text-xs font-bold text-orange-600 flex items-center justify-center gap-1">
                                            {aiData?.prediction?.trend || "Calculating trajectory..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Action Steps */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
                            <h3 className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Lightbulb size={16} className="text-orange-500" /> Targeted AI Action Steps
                            </h3>
                            <div className="space-y-4 flex-1 flex flex-col justify-center">
                                {aiData?.recommendations?.map((item, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-[#7acb1f]/50 hover:bg-[#f8fcf5] transition-all cursor-default">
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1 leading-snug">{item.desc}</p>
                                        </div>
                                        <span className={`shrink-0 generals-badge self-start sm:self-auto bg-white text-[10px] md:text-xs font-black px-2 py-1 rounded-lg border uppercase transition-colors ${item.level === 'High Impact' ? 'text-rose-600 border-rose-100 bg-rose-50' :
                                            item.level === 'Medium Impact' ? 'text-amber-600 border-amber-100 bg-amber-50' : 'text-sky-600 border-sky-100 bg-sky-50'
                                            }`}>
                                            {item.level.split(" ")[0]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* 4. BOTTOM CHAT ASSISTANT (WIDE SECTION) */}
            <div className="mt-8 md:mt-12 bg-white rounded-3xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-[500px] md:h-[600px]">

                {/* Chat Header */}
                <div className="bg-gradient-to-r from-[#63b015] to-[#4e8e10] p-4 md:p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2.5 rounded-xl md:rounded-2xl text-white backdrop-blur-sm">
                            <Bot size={24} />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-base md:text-lg">Ask ExpenseIQ Assistant</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="h-2 w-2 rounded-full bg-[#a8e063] animate-pulse"></div>
                                <span className="text-[#eef8e7] text-[10px] md:text-[11px] font-bold tracking-widest uppercase">Intelligent Agent Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-gray-50/50">
                    {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 md:gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-gray-800 text-white' : 'bg-[#63b015] text-white'}`}>
                                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`whitespace-pre-wrap max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${msg.sender === 'user'
                                ? 'bg-gray-800 text-white rounded-br-sm'
                                : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}

                    {/* Chatting Loader Element */}
                    {chatLoading && (
                        <div className="flex items-end gap-2 md:gap-3">
                            <div className="h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-[#63b015] text-white shrink-0 shadow-sm">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white border-t border-gray-100 flex gap-2 md:gap-3">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        disabled={chatLoading}
                        placeholder={chatLoading ? "AI is processing..." : "E.g. How much did I spend on food last week?"}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-[#63b015]/50 focus:border-[#63b015] outline-none transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={chatLoading || !chatInput.trim()}
                        className="bg-gradient-to-r from-[#7acb1f] to-[#63b015] hover:from-[#84d624] hover:to-[#5aa013] text-white px-5 md:px-6 rounded-xl md:rounded-2xl transition-all flex items-center justify-center shadow-md disabled:opacity-50"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AIInsights;