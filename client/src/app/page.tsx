import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  ShieldCheck,
  Settings,
  Layers,
  BrainCircuit,
  MessageSquare,
  Zap,
  TrendingUp,
  Scale,
  Lightbulb,
  ArrowRight,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white text-[#111827]">
      <Navbar />



      {/* Hero Section with Ripple Background */}
      <section className="relative pt-32 pb-48 overflow-hidden ripple-bg">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Social Proof Bar */}
          {/* <div className="flex justify-center mb-16">
            <div className="social-proof-bar flex items-center gap-6 shadow-sm">
              <div className="flex items-center gap-2 border-r pr-6 border-gray-200">
                <span className="font-bold text-[#111827] text-lg italic">Gartner</span>
              </div>
              <p className="text-xs font-medium text-gray-600 hidden md:block">
                Startup Swarm named a leader in the Gartner® Magic Quadrant™ for AI Accelerator Platforms, 2026
              </p>
              <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-gray-900 border border-gray-900 px-3 py-1 rounded ml-4 hover:bg-gray-900 hover:text-white transition-colors">
                Access Report
              </a>
            </div>
          </div> */}

          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold leading-tight mb-8 tracking-tight text-[#111827]">
              Agentic AI <br />
              <span className="text-gray-800">Accelerator</span> <br />
              Decisions.
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
              Autonomous AI agents analyze, debate, and evaluate your startup idea — delivering a real go/no-go decision and roadmap.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/architect" className="px-10 py-5 bg-[#111827] text-white rounded-full font-bold hover:bg-black transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-3 shadow-xl shadow-gray-900/10 active:scale-95">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="px-10 py-5 bg-white/50 backdrop-blur-sm text-[#111827] border border-gray-200 rounded-full font-bold hover:bg-white hover:border-gray-300 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-3 active:scale-95">
                See Case Studies <ExternalLink className="w-4 h-4 opacity-50" />
              </button>
            </div>
          </div>

          {/* Three Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-40">
            {[
              {
                title: "Pre-seed Validation",
                desc: "Use agents for Market, Tech, Funding, and Legal due diligence today.",
                icon: <Zap className="w-5 h-5 text-gray-400" />
              },
              {
                title: "Accelerator Orchestrators",
                desc: "Leverage our Marketplace of pre-built AI agents, templates, and frameworks.",
                icon: <Layers className="w-5 h-5 text-gray-400" />
              },
              {
                title: "Tailored Analysis",
                desc: "Design / build custom agents on our Swarm Platform across all niche verticals.",
                icon: <Settings className="w-5 h-5 text-gray-400" />
              }
            ].map((card, i) => (
              <div key={i} className="enterprise-card p-10 flex flex-col justify-between group cursor-pointer">
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-2xl font-bold text-[#111827] group-hover:text-blue-600 transition-colors">{card.title}</h3>
                    <div className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the Swarm Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl font-bold mb-4 tracking-tight">Meet the Specialized Agents</h2>
              <p className="text-gray-600 font-medium">Your specialized board of directors, active 24/7, delivering institutional-grade validation.</p>
            </div>
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800">
              Explore Agent Marketplace <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: "Market Research", icon: <BarChart3 className="w-6 h-6" />, color: "bg-emerald-50 text-emerald-600" },
              { name: "Tech Feasibility", icon: <Settings className="w-6 h-6" />, color: "bg-blue-50 text-blue-600" },
              { name: "Funding Analyst", icon: <TrendingUp className="w-6 h-6" />, color: "bg-purple-50 text-purple-600" },
              { name: "Legal Counsel", icon: <Scale className="w-6 h-6" />, color: "bg-amber-50 text-amber-600" },
              { name: "Mentor Orchestrator", icon: <BrainCircuit className="w-6 h-6" />, color: "bg-rose-50 text-rose-600" }
            ].map((agent, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${agent.color}`}>
                  {agent.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{agent.name}</h4>
                <div className="flex items-center gap-1 text-xs font-bold text-gray-400 uppercase">
                  <span>View Bio</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intelligence & Decision Making */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 blur-[100px] opacity-30 rounded-full" />
            <div className="bg-white rounded-[2rem] border border-gray-200 shadow-xl overflow-hidden relative z-10">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Protocol Visualization v1.2</span>
              </div>
              <div className="p-8 space-y-6">
                {[
                  { user: "Market Agent", text: "Crowded market. User acquisition costs are rising rapidly.", icon: <BarChart3 />, color: "bg-emerald-500" },
                  { user: "Tech Agent", text: "Easy MVP. Core infrastructure can be deployed in weeks.", icon: <Settings />, color: "bg-blue-500" },
                  { user: "Funding Agent", text: "Weak differentiation. Low venture capital appeal.", icon: <TrendingUp />, color: "bg-purple-500" }
                ].map((msg, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-8 h-8 rounded-lg ${msg.color} flex items-center justify-center shrink-0`}>
                      <span className="text-white text-[10px]">{msg.icon}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl rounded-tl-none">
                      <p className="text-xs font-bold text-gray-900 mb-1">{msg.user}</p>
                      <p className="text-sm text-gray-600 italic">"{msg.text}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h2 className="text-5xl font-bold tracking-tight text-[#111827]">
              Where AI Agents Disagree, <span className="text-blue-600 italic">Innovation Begins.</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              Startup Swarm doesn't just average opinions. It creates a synthetic debate room where specialized agents argue over strategy until the Mentor Orchestrator finds the winning pivot.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-900 font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </div>
                Multi-Agent Conflict Resolution
              </div>
              <div className="flex items-center gap-3 text-gray-900 font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </div>
                Synthetic Market Validation
              </div>
            </div>
            <button className="px-10 py-5 bg-[#111827] text-white rounded-full font-bold hover:bg-black transition-all uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 shadow-xl shadow-gray-900/10 active:scale-95">
              Get Started with Swarm <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20 text-sm font-medium">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-6 h-6 text-[#111827]" />
                <span className="text-xl font-bold tracking-tight">Startup Swarm</span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                The leading analyst-recognized AI agent platform for startup validation.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111827] cursor-pointer"><ArrowRight className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111827] cursor-pointer"><ArrowRight className="w-4 h-4" /></div>
                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#111827] cursor-pointer"><ArrowRight className="w-4 h-4" /></div>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 border-l-2 border-blue-600 pl-4">Platform</h5>
              <ul className="space-y-4 text-gray-600">
                <li className="hover:text-black cursor-pointer">Agent Studio</li>
                <li className="hover:text-black cursor-pointer">Marketplace</li>
                <li className="hover:text-black cursor-pointer">Enterprise API</li>
                <li className="hover:text-black cursor-pointer">Security</li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 border-l-2 border-emerald-600 pl-4">Solutions</h5>
              <ul className="space-y-4 text-gray-600">
                <li className="hover:text-black cursor-pointer">Incubators</li>
                <li className="hover:text-black cursor-pointer">Venture Capital</li>
                <li className="hover:text-black cursor-pointer">Founder Suite</li>
                <li className="hover:text-black cursor-pointer">Corporate Innovation</li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8 border-l-2 border-purple-600 pl-4">Resources</h5>
              <ul className="space-y-4 text-gray-600">
                <li className="hover:text-black cursor-pointer">Analyst Reports</li>
                <li className="hover:text-black cursor-pointer">White Papers</li>
                <li className="hover:text-black cursor-pointer">Documentation</li>
                <li className="hover:text-black cursor-pointer">Support</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:row items-center justify-between gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <p>© 2026 Startup Swarm Engineering. Confidential.</p>
            <div className="flex gap-8">
              <span className="hover:text-black cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-black cursor-pointer transition-colors">Terms of Service</span>
              <span className="hover:text-black cursor-pointer transition-colors">Explore our technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

