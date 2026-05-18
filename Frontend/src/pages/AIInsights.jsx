import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles, ArrowUpRight, Lightbulb, Send, RefreshCw,
    Bot, TrendingUp, ShieldCheck, Zap, User
} from 'lucide-react';
import { dashboardStyles } from '../assets/dummyStyles';

const AIInsights = () => {
    const [loading, setLoading] = useState(false);
    const [chatInput, setChatInput] = useState("");
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: 'Hey! Main aapka ExpenseIQ AI advisor hu. Maine aapke transactions analyze kar liye hain. Kya aap budget optimization ke baare me kuch poochna chahte hain?' }
    ]);

    const chatEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const aiData = {
        summary: [
            "You spent 18% more this month compared to last month.",
            "Food category is your highest expense currently.",
            "You may save ₹2,500 by reducing entertainment expenses this week."
        ],
        prediction: {
            expense: "₹17,800",
            savings: "₹5,200",
            trend: "Upward trend by 4.2% over weekends"
        },
        recommendations: [
            { title: "Reduce food delivery expenses", desc: "Zomato/Swiggy orders are 25% higher than your average weekday. Cooking at home can save ₹1,200.", level: "High Impact" },
            { title: "Set a travel budget", desc: "Cab bookings peaked during mid-weeks. Consider public transport for short distances.", level: "Medium Impact" },
            { title: "Avoid weekend overspending", desc: "Friday nights account for 40% of your weekly entertainment block.", level: "Smart Save" }
        ],
        healthScore: 78
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newMessages = [...chatMessages, { sender: 'user', text: chatInput }];
        setChatMessages(newMessages);
        setChatInput("");

        setTimeout(() => {
            setChatMessages(prev => [...prev, {
                sender: 'ai',
                text: "Pichle patterns ko dekhte hue, main suggest karunga ki aap agle 5 din non-essential shopping avoid karein. Isse aapka savings goal 90% tak achieve ho sakta hai! 🚀"
            }]);
        }, 1000);
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
                    <button className={dashboardStyles.addButton}>
                        <RefreshCw size={18} /> Re-Analyze
                    </button>
                </div>
            </div>

            {/* 2. Top Summary & Prediction Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Quick AI Pulse (Left) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 text-gray-800 relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-[#63b015]">
                        <Zap size={120} strokeWidth={1} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-2 text-[#63b015] font-bold tracking-widest text-xs md:text-sm uppercase">
                            <Zap size={14} fill="currentColor" /> Quick AI Pulse
                        </div>
                        <div className="space-y-4 md:space-y-5 mt-6">
                            {aiData.summary.map((text, i) => (
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
                <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest">Financial Health</h3>
                        <ShieldCheck className="text-[#63b015]" size={20} />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-black text-gray-800">{aiData.healthScore}</span>
                        <span className="text-lg md:text-xl text-gray-400 font-bold">/100</span>
                    </div>
                    <div className="w-full bg-gray-100 h-4 rounded-full mt-6 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-[#7acb1f] to-[#63b015] h-full rounded-full transition-all duration-1000"
                            style={{ width: `${aiData.healthScore}%` }}
                        ></div>
                    </div>
                    <p className="text-gray-500 text-sm mt-4 font-medium italic">"Stable: You are performing better than 72% of users."</p>
                </div>
            </div>

            {/* 3. Prediction & Recommendation Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

                {/* Spending Prediction */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <h3 className="text-gray-400 font-bold text-xs md:text-sm uppercase tracking-widest mb-6">Spending Prediction 📈</h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Estimated Total for this Month</p>
                            <p className="text-3xl md:text-4xl font-bold text-gray-800">{aiData.prediction.expense}</p>
                        </div>
                        <div className="flex gap-8 md:gap-10 pt-6 border-t border-gray-100 mt-6">
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-1">SAVINGS</p>
                                <p className="text-xl font-bold text-[#63b015]">{aiData.prediction.savings}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold mb-1">TREND</p>
                                <p className="text-sm font-bold text-orange-500 flex items-center gap-1 mt-1">
                                    <ArrowUpRight size={16} /> High on Weekends
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Action Steps */}
                <div className="space-y-4">
                    <h3 className="text-gray-800 font-bold text-lg flex items-center gap-2 mb-4 md:mb-6">
                        <Lightbulb size={20} className="text-orange-500" /> Targeted AI Action Steps
                    </h3>
                    <div className="space-y-3">
                        {aiData.recommendations.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-[#7acb1f]/50 hover:bg-[#f8fcf5] transition-all cursor-default">
                                <div className="pr-4">
                                    <h4 className="font-bold text-gray-800 text-sm md:text-base">{item.title}</h4>
                                    <p className="text-xs md:text-sm text-gray-500 mt-1 leading-snug">{item.desc}</p>
                                </div>
                                <span className="shrink-0 bg-white text-gray-500 text-[10px] md:text-xs font-black px-2 md:px-3 py-1 rounded-lg border border-gray-200 group-hover:bg-[#eef8e7] group-hover:text-[#63b015] group-hover:border-[#7acb1f]/30 uppercase transition-colors">
                                    {item.level.split(" ")[0]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

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
                            <div className={`max-w-[85%] md:max-w-[75%] p-3 md:p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${msg.sender === 'user'
                                    ? 'bg-gray-800 text-white rounded-br-sm'
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} className="p-3 md:p-4 bg-white border-t border-gray-100 flex gap-2 md:gap-3">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="E.g. How much did I spend on food last week?"
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-[#63b015]/50 focus:border-[#63b015] outline-none transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-[#7acb1f] to-[#63b015] hover:from-[#84d624] hover:to-[#5aa013] text-white px-5 md:px-6 rounded-xl md:rounded-2xl transition-all flex items-center justify-center shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>

        </div>
    );
};

export default AIInsights;