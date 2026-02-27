"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import gsap from "gsap";
import {
    Send,
    Loader2,
    Building,
    Target,
    DollarSign,
    TrendingUp,
    AlertTriangle,
    Zap,
    Briefcase,
    Layers,
    BrainCircuit
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
    id: string;
    sender: "user" | "agent";
    content: string;
    isBlueprint?: boolean;
}

export default function ArchitectPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "agent",
            content: "Hello! I am your AI Startup Architect. Tell me your startup idea, and we'll refine it together. What problem are you solving and who is it for?",
        }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [threadId, setThreadId] = useState("");
    const [blueprint, setBlueprint] = useState<any>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const blueprintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Generate a new thread ID on mount
        setThreadId(uuidv4());
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (blueprint && blueprintRef.current) {
            gsap.fromTo(
                ".blueprint-card",
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.1,
                    ease: "power3.out"
                }
            );
        }
    }, [blueprint]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: uuidv4(),
            sender: "user",
            content: inputValue
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/ai/chat", {
                message: userMessage.content,
                threadId: threadId
            });

            let content = response.data.response;
            let isJson = false;
            let parsedBlueprint = null;

            try {
                // Try to parse the response as JSON (if it is the final blueprint)
                // Ensure it looks like JSON first to avoid breaking markdown text
                const text = content.trim();
                if (text.startsWith("{") && text.endsWith("}")) {
                    parsedBlueprint = JSON.parse(text);
                    if (parsedBlueprint.businessOverview) {
                        isJson = true;
                    }
                }
            } catch (e) {
                // Not a JSON blueprint
            }

            if (isJson && parsedBlueprint) {
                setBlueprint(parsedBlueprint);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: uuidv4(),
                        sender: "agent",
                        content: "I have generated your structured business blueprint! ✅",
                        isBlueprint: true
                    }
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    {
                        id: uuidv4(),
                        sender: "agent",
                        content: content
                    }
                ]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: uuidv4(),
                    sender: "agent",
                    content: "Sorry, I encountered an error. Please try again."
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderBlueprint = () => {
        if (!blueprint) return null;

        return (
            <div ref={blueprintRef} className="w-full h-full overflow-y-auto p-8 bg-gray-50 border-l border-gray-200 custom-scrollbar">
                <h2 className="text-3xl font-bold mb-8 text-[#111827] flex items-center gap-3">
                    <Zap className="text-blue-600 w-8 h-8" />
                    Business Blueprint
                </h2>

                {/* Overview section */}
                <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-xl font-bold text-gray-900">Company Overview</h3>
                    </div>
                    <div className="space-y-3">
                        <p><strong>Name:</strong> {blueprint.businessOverview?.name}</p>
                        <p><strong>Description:</strong> {blueprint.businessOverview?.description}</p>
                        <p className="flex items-center gap-2 mt-2">
                            <Target className="w-4 h-4 text-rose-500" />
                            <strong>Target Audience:</strong> {blueprint.businessOverview?.targetAudience}
                        </p>
                        <p className="bg-indigo-50 p-3 rounded-lg text-indigo-900 mt-2 italic font-medium">
                            "{blueprint.businessOverview?.valueProposition}"
                        </p>
                    </div>
                </div>

                {/* Services */}
                <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-5 h-5 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900">Services</h3>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {blueprint.services?.map((service: any, idx: number) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <h4 className="font-bold text-gray-900 mb-1">{service.title}</h4>
                                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                                <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                                    {service.pricingModel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Revenue Model */}
                    <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-xl font-bold text-gray-900">Revenue Model</h3>
                        </div>
                        <ul className="list-disc pl-5 space-y-2">
                            {blueprint.revenueModel?.map((rev: string, idx: number) => (
                                <li key={idx} className="text-gray-700">{rev}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Cost Structure */}
                    <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-5 h-5 text-red-500" />
                            <h3 className="text-xl font-bold text-gray-900">Cost Structure</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">One-Time Setup:</h4>
                                <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                                    {blueprint.costStructure?.oneTimeSetup?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm">Monthly Expenses:</h4>
                                <ul className="list-disc pl-5 mt-1 text-sm text-gray-600">
                                    {blueprint.costStructure?.monthlyExpenses?.map((item: string, idx: number) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Execution & Risks */}
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Briefcase className="w-5 h-5 text-purple-600" />
                            <h3 className="text-xl font-bold text-gray-900">Execution Steps</h3>
                        </div>
                        <ul className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                            {blueprint.initialExecutionSteps?.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="blueprint-card bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                            <h3 className="text-xl font-bold text-gray-900">Risks</h3>
                        </div>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                            {blueprint.risks?.map((risk: string, idx: number) => (
                                <li key={idx}>{risk}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Growth */}
                <div className="blueprint-card bg-gradient-to-br from-blue-900 to-[#111827] text-white p-6 rounded-2xl shadow-lg border border-gray-800">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xl font-bold text-white">Growth Opportunities</h3>
                    </div>
                    <ul className="space-y-3">
                        {blueprint.growthOpportunities?.map((opp: string, idx: number) => (
                            <li key={idx} className="flex flex-col">
                                <span className="flex items-center gap-2 text-sm text-gray-200">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    {opp}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-screen bg-white">
            {/* Chat Section */}
            <div className={`flex flex-col h-full transition-all duration-500 ${blueprint ? "w-1/3" : "w-full max-w-4xl mx-auto"}`}>
                {/* Header */}
                <header className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div>
                        <h1 className="text-xl font-bold text-[#111827]">Startup Architect</h1>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">AI Co-founder & Strategist</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                        <BrainCircuit className="w-5 h-5 text-blue-600" />
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gray-50/50">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.sender === "user"
                                    ? "bg-[#111827] text-white rounded-tr-none"
                                    : "bg-white border border-gray-200 text-gray-800 rounded-tl-none"
                                    }`}
                            >
                                {msg.sender === "agent" && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Zap className="w-3 h-3 text-blue-600" />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Architect</span>
                                    </div>
                                )}
                                {msg.isBlueprint ? (
                                    <p className="font-medium text-emerald-600">{msg.content}</p>
                                ) : (
                                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                <span className="text-sm text-gray-500 font-medium">Analyzing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <div className="relative">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Describe your idea, budget, location..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-4 pr-14 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-800 resize-none"
                            rows={2}
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-3 bottom-4 w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-blue-500/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
                        Startup Swarm AI
                    </p>
                </div>
            </div>

            {/* Blueprint Visualizer */}
            {blueprint && (
                <div className="w-2/3 h-full border-l border-gray-200 bg-gray-50">
                    {renderBlueprint()}
                </div>
            )}
        </div>
    );
}
