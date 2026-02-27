"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import gsap from "gsap";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Loader2,
    Building2,
    Target,
    ShieldAlert,
    Users,
    Activity,
    Zap,
    ScrollText,
    TrendingUp,
    ShieldCheck,
    AlertCircle,
    BarChart3,
    Construction,
    Sparkles,
    Lightbulb,
    ArrowRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Question {
    id: number;
    title: string;
    description: string;
    placeholder: string;
    options: string[];
}

const QUESTIONS: Question[] = [
    {
        id: 1,
        title: "The Core Blueprint",
        description: "What exactly are you building, and what is your unique solution?",
        placeholder: "e.g., We are building an AI tool for lawyers that...",
        options: ["SaaS / Software", "Direct-to-Consumer", "Marketplace", "Service-Based"]
    },
    {
        id: 2,
        title: "Market Domain",
        description: "Who exactly is your primary target customer?",
        placeholder: "Describe your ideal user persona...",
        options: ["Enterprise / B2B", "Mid-Market / SMBs", "Individual Consumers", "Government / Niche"]
    },
    {
        id: 3,
        title: "Defensibility Moat",
        description: "How will you prevent others from copying you?",
        placeholder: "IP, network effects, or data advantages...",
        options: ["Proprietary Technology", "Network Effects", "High Switching Costs", "Brand & Speed"]
    },
    {
        id: 4,
        title: "Builder Profile",
        description: "What is your team's unfair advantage?",
        placeholder: "Skills of the founding team...",
        options: ["Technical Experts", "Growth & Sales Hacks", "Deep Industry Insider", "Operations Masters"]
    },
    {
        id: 5,
        title: "Traction Pulse",
        description: "What is your current level of validation?",
        placeholder: "Be honest - it helps the AI be realistic...",
        options: ["Conceptual Idea", "Customer Interviews", "Working MVP", "Early Paying Users"]
    }
];

type AppState = "pitch" | "discovery" | "wizard" | "blueprint";

export default function ArchitectPage() {
    const [appState, setAppState] = useState<AppState>("pitch");
    const [rawIdea, setRawIdea] = useState("");
    const [discoveryInsight, setDiscoveryInsight] = useState("");
    const [currentStep, setCurrentStep] = useState(1);
    const [answers, setAnswers] = useState<Record<number, { text: string; option: string }>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [blueprint, setBlueprint] = useState<any>(null);
    const [threadId] = useState(uuidv4());

    useEffect(() => {
        gsap.from(".fade-in", {
            opacity: 0,
            y: 20,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });
    }, [appState]);

    const handleInitialPitch = async () => {
        if (!rawIdea.trim()) return;
        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:8000/api/ai/chat", {
                message: `I have a startup idea: "${rawIdea}". Give me a strategic first impression and some specialized architect tips for this domain.`,
                threadId: threadId
            });
            setDiscoveryInsight(response.data.response);
            setAppState("discovery");
        } catch (error) {
            console.error("Discovery Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextWizard = () => {
        if (!answers[currentStep]?.text && !answers[currentStep]?.option) return;
        if (currentStep < QUESTIONS.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            generateBlueprint();
        }
    };

    const generateBlueprint = async () => {
        setIsLoading(true);
        try {
            const consolidatedData = Object.entries(answers).map(([id, data]) => {
                const q = QUESTIONS.find(q => q.id === parseInt(id));
                return `${q?.title}: ${data.option} | Details: ${data.text}`;
            }).join("\n");

            const response = await axios.post("http://localhost:8000/api/ai/chat", {
                message: `User is ready for the blueprint. Context idea: ${rawIdea}. Here is the structured data:\n${consolidatedData}`,
                threadId: threadId
            });

            const content = response.data.response;
            setBlueprint(JSON.parse(content));
            setAppState("blueprint");
        } catch (error) {
            console.error("Blueprint error:", error);
            alert("Strategic connection lost.");
        } finally {
            setIsLoading(false);
        }
    };

    // --- Sub-components ---

    const ScoreCard = ({ title, score, insight, icon: Icon, color }: any) => (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
                </div>
                <div className="text-right">
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Score</span>
                    <span className="text-2xl font-black text-gray-900">{score}%</span>
                </div>
            </div>
            <div>
                <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
                <p className="text-xs text-gray-500 font-medium leading-relaxed line-clamp-2">{insight}</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${score}%` }} />
            </div>
        </div>
    );

    // --- Render Logic ---

    if (appState === "pitch") {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px]" />
                </div>

                <div className="w-full max-w-3xl relative z-10 text-center">
                    <div className="fade-in inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 mb-8">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Startup Architect v2.0</span>
                    </div>
                    <h1 className="fade-in text-5xl lg:text-7xl font-black text-[#111827] tracking-tight mb-8 leading-[1.1]">
                        What's the <span className="text-blue-600 block italic">Big Vision?</span>
                    </h1>
                    <p className="fade-in text-xl text-gray-500 font-medium mb-12 max-w-2xl mx-auto">
                        Pitch your raw concept. Our specialized agent swarm will analyze it before we move to structural engineering.
                    </p>

                    <div className="fade-in relative group max-w-2xl mx-auto">
                        <textarea
                            value={rawIdea}
                            onChange={(e) => setRawIdea(e.target.value)}
                            placeholder="I want to start a subscription box for sustainable pet owners..."
                            className="w-full p-8 pr-32 bg-white border-2 border-gray-100 rounded-[2.5rem] shadow-xl focus:border-blue-200 outline-none min-h-[140px] text-lg font-medium text-gray-800 placeholder:text-gray-300 transition-all"
                        />
                        <button
                            onClick={handleInitialPitch}
                            disabled={!rawIdea.trim() || isLoading}
                            className="absolute right-4 bottom-4 px-8 py-5 bg-[#111827] text-white rounded-[1.8rem] font-bold shadow-lg hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pitch to Swarm"}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (appState === "discovery") {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 lg:p-12 relative">
                <div className="w-full max-w-4xl bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5">
                        <Building2 className="w-48 h-48" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-blue-600 rounded-2xl text-white">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest">Architect's First Impression</h3>
                                <p className="text-sm font-bold text-gray-400">Contextual Insight Detected</p>
                            </div>
                        </div>

                        <div className="prose prose-lg max-w-none text-gray-700 font-medium leading-relaxed mb-12 prose-p:mb-6">
                            <ReactMarkdown>{discoveryInsight}</ReactMarkdown>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-12">
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex gap-4 items-start">
                                <Lightbulb className="w-6 h-6 text-amber-500 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">Structural Prep</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">We've identified key market hurdles. Next, we categorize your defensibility and traction.</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex gap-4 items-start">
                                <Construction className="w-6 h-6 text-blue-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-1">The 5-Step Deep-Dive</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed font-medium">Proceeding to step-by-step structural engineering to build the revenue roadmap.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setAppState("wizard")}
                            className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group text-lg"
                        >
                            Proceed to Structural Engineering
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (appState === "wizard") {
        const currentQ = QUESTIONS[currentStep - 1];
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-6xl grid lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-xl relative h-full">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Blueprint Development</h3>
                            <div className="space-y-8 relative">
                                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-100" />
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="flex items-center gap-6 relative">
                                        <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-500 ${currentStep > s ? "bg-blue-600 border-blue-600 text-white" :
                                            currentStep === s ? "bg-white border-blue-600 text-blue-600 shadow-lg shadow-blue-100" :
                                                "bg-white border-gray-200 text-gray-300"
                                            }`}>
                                            {currentStep > s ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-black">{s}</span>}
                                        </div>
                                        <p className={`text-sm font-bold ${currentStep === s ? "text-gray-900" : "text-gray-400"}`}>
                                            {QUESTIONS[s - 1].title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[10px] font-black uppercase text-gray-400">Total Completion</span>
                                    <span className="text-xs font-black text-blue-600">{Math.round((currentStep / QUESTIONS.length) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${(currentStep / QUESTIONS.length) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-3">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-2xl relative min-h-[500px] flex flex-col">
                            {isLoading ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-[6px] border-blue-100 rounded-full" />
                                        <div className="w-24 h-24 border-[6px] border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0" />
                                        <Zap className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                    </div>
                                    <div className="text-center">
                                        <h2 className="text-2xl font-black text-gray-900 mb-2">Simulating Board Meeting</h2>
                                        <p className="text-gray-500 font-medium">Specialized agents are critiquing your strategy...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex-1">
                                        <h2 className="text-3xl font-black text-[#111827] mb-3">{currentQ.title}</h2>
                                        <p className="text-gray-500 font-medium text-lg mb-10">{currentQ.description}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {currentQ.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setAnswers(prev => ({ ...prev, [currentStep]: { ...prev[currentStep], option: opt } }))}
                                                    className={`p-5 rounded-2xl border-2 text-left font-bold transition-all ${answers[currentStep]?.option === opt ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-50 bg-gray-50 hover:border-gray-200 text-gray-600"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={answers[currentStep]?.text || ""}
                                            onChange={(e) => setAnswers(prev => ({ ...prev, [currentStep]: { ...prev[currentStep], text: e.target.value } }))}
                                            placeholder={currentQ.placeholder}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-50 focus:bg-white rounded-2xl p-6 min-h-[140px] outline-none transition-all text-gray-800 font-medium"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                                        <button onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="p-4 bg-gray-100 text-gray-400 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-0"><ChevronLeft /></button>
                                        <button onClick={handleNextWizard} disabled={!answers[currentStep]?.option && !answers[currentStep]?.text} className="px-8 py-5 bg-[#111827] text-white rounded-[1.5rem] font-bold shadow-xl hover:bg-black transition-all flex items-center gap-3 disabled:opacity-50">
                                            <span className="uppercase tracking-widest text-xs">{currentStep === QUESTIONS.length ? "Finalize Strategy" : "Next Module"}</span>
                                            <ChevronRight />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (appState === "blueprint") {
        return (
            <div className="min-h-screen bg-white p-8 blueprint-reveal">
                <div className="max-w-7xl mx-auto">
                    <header className="flex items-center justify-between mb-12">
                        <div>
                            <span className="text-blue-600 font-bold text-xs uppercase tracking-[0.3em]">Seed Strategy Blueprint</span>
                            <h1 className="text-4xl font-black text-[#111827] mt-2">Executive Roadmap</h1>
                        </div>
                        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-full font-bold text-xs uppercase tracking-widest">New Build</button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        <ScoreCard title="Market Viability" score={blueprint.agentScoring?.marketReseach?.score} insight={blueprint.agentScoring?.marketReseach?.insight} icon={BarChart3} color="bg-emerald-500" />
                        <ScoreCard title="Defensibility" score={blueprint.agentScoring?.competitionIntel?.score} insight={blueprint.agentScoring?.competitionIntel?.insight} icon={ShieldCheck} color="bg-blue-500" />
                        <ScoreCard title="Execution Risk" score={blueprint.agentScoring?.executionRisk?.score} insight={blueprint.agentScoring?.executionRisk?.insight} icon={AlertCircle} color="bg-rose-500" />
                        <ScoreCard title="PMF Probability" score={blueprint.agentScoring?.pmfProbability?.score} insight={blueprint.agentScoring?.pmfProbability?.insight} icon={Target} color="bg-purple-500" />
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-[#111827] text-white p-10 rounded-[2.5rem] shadow-2xl">
                                <h3 className="text-xs font-bold uppercase tracking-[0.4em] text-blue-400 mb-6">Mission Context</h3>
                                <h2 className="text-3xl font-bold mb-4">{blueprint.businessOverview?.name}</h2>
                                <p className="text-blue-100/80 text-lg leading-relaxed mb-8 font-medium">{blueprint.businessOverview?.description}</p>
                                <div className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-xl text-sm italic">"{blueprint.businessOverview?.valueProposition}"</div>
                            </div>
                            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Construction className="text-blue-600" /> Strategic Roadmap</h3>
                                <div className="space-y-6">
                                    {blueprint.strategicRoadmap?.map((step: string, i: number) => (
                                        <div key={i} className="flex gap-6">
                                            <div className="w-10 h-10 rounded-full bg-white border-2 border-blue-600 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">{i + 1}</div>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-1"><p className="text-gray-800 font-bold">{step}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200">
                                <h3 className="text-lg font-black mb-6 uppercase tracking-wider">Growth & Finance</h3>
                                <div className="space-y-4">
                                    {blueprint.revenueModel?.map((item: string, i: number) => (
                                        <div key={i} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-700">{item}</div>
                                    ))}
                                    {blueprint.costStructure?.monthlyExpenses?.map((item: string, i: number) => (
                                        <div key={i} className="p-4 bg-rose-50 rounded-xl border border-rose-100 text-xs font-bold text-rose-700">{item}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
