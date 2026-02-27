"use client";

import Link from "next/link";
import { BrainCircuit, ChevronDown, ArrowRight, Menu } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 ${scrolled ? "pt-4" : "pt-6"}`}>
            <nav className={`
        max-w-7xl mx-auto rounded-full transition-all duration-500 flex items-center px-4 md:px-8
        ${scrolled
                    ? "h-16 bg-white/70 backdrop-blur-[20px] border border-white/50 shadow-[0_30px_100px_-10px_rgba(0,0,0,0.15),0_15px_50px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/40 ring-inset"
                    : "h-20 bg-white/30 backdrop-blur-[12px] border border-white/20 shadow-[0_20px_80px_-15px_rgba(0,0,0,0.08)] ring-1 ring-white/20 ring-inset"
                }
      `}>
                <div className="w-full flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                            <div className="w-8 h-8 bg-[#111827] rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300">
                                <BrainCircuit className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-[#111827]">Startup Swarm</span>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-gray-500">
                            {[
                                { name: "Solutions", hasMenu: true },
                                { name: "Platform", hasMenu: true },
                                { name: "Resources", hasMenu: true },
                                { name: "Pricing", hasMenu: false }
                            ].map((item) => (
                                <a
                                    key={item.name}
                                    href="#"
                                    className="px-4 py-2 rounded-full hover:bg-gray-900/5 hover:text-black transition-all flex items-center gap-1 group"
                                >
                                    {item.name}
                                    {item.hasMenu && <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:translate-y-0.5 transition-transform" />}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-medium">
                        <button className="relative group overflow-hidden px-8 py-3 bg-[#111827] text-white rounded-full font-bold transition-all hover:pr-10 active:scale-95 shadow-xl shadow-gray-900/10">
                            <span className="relative z-10 uppercase text-[10px] tracking-[0.15em]">Get Started</span>
                            <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>


            {/* Subtle bottom shine effect */}
            <div className={`max-w-7xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-blue-400/20 to-transparent transition-opacity duration-1000 ${scrolled ? "opacity-100" : "opacity-0"}`} />
        </div>
    );
}
