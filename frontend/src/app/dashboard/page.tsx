"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  ChevronDown,
  Activity,
  Zap,
  Briefcase,
  AlertOctagon,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface TrackedCompany {
  id: number;
  company_name: string;
  company_domain: string;
  created_at: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [companyInput, setCompanyInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackedCompanies, setTrackedCompanies] = useState<TrackedCompany[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchTrackedCompanies();
  }, []);

  const fetchTrackedCompanies = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports`);
      if (res.ok) {
        const data = await res.json();
        setTrackedCompanies(data);
      }
    } catch (err) {
      console.error("Failed to load tracked companies:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async (tag?: string) => {
    const inputToUse = typeof tag === 'string' ? tag.trim() : companyInput.trim();
    if (!inputToUse) return;
    try {
      if (typeof tag === 'string') setCompanyInput(tag);
      setIsProcessing(true);
      setError(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: inputToUse }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to launch pipeline");
      }
      const { job_id, company_id } = await res.json();
      router.push(`/dashboard/profile/${company_id}?job_id=${job_id}`);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex w-full h-full animate-fade-in bg-[var(--surface-subtle)]">
      
      {/* Main Content Column */}
      <div className="flex-1 overflow-y-auto px-10 py-10">
        
        {/* Intelligence Discovery Section */}
        <div className="bg-white rounded-2xl p-8 mb-8 border border-[var(--border-default)] shadow-sm">
          <h1 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Intelligence Discovery</h1>
          
          <div className="flex items-center bg-[var(--surface-subtle)] rounded-xl p-2 mb-4 border border-[var(--border-default)] focus-within:border-[var(--brand-primary)] focus-within:ring-1 focus-within:ring-[var(--brand-primary)] transition-all">
            <div className="pl-4 pr-3">
              <Sparkles className="h-5 w-5 text-[var(--text-tertiary)]" />
            </div>
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
              disabled={isProcessing}
              placeholder="Ask anything: 'Find Series A Fintech startups...'"
              className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] disabled:opacity-50"
            />
            <button
              onClick={() => handleAnalyze()}
              disabled={isProcessing}
              className="bg-[var(--brand-primary-light)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors px-8 py-3 rounded-lg font-bold text-sm ml-2 flex items-center justify-center min-w-[120px]"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mb-4 ml-2">{error}</p>}

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {['DOMAIN: SaaS', 'REGION: Global', 'STAGE: Any', 'TECH: LLMs'].map((pill, idx) => {
              const [label, val] = pill.split(': ');
              return (
                <div key={idx} className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--border-default)] bg-white text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                  <span className="text-[var(--text-tertiary)] font-semibold">{label}:</span>
                  <span className="text-[var(--text-primary)] font-bold">{val}</span>
                  <ChevronDown className="h-3 w-3 text-[var(--text-tertiary)] ml-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "TOTAL COMPANIES", val: "4.2M", up: "+1.2%", c: "text-emerald-600" },
            { label: "SIGNALS TODAY", val: "+12,482", up: "LIVE", c: "text-emerald-600" },
            { label: "ACTIVE INVESTORS", val: "84,103", up: "LIVE", c: "text-emerald-600" },
            { label: "MARKET VELOCITY", val: "94.2", up: "📈", c: "text-indigo-600" }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-[var(--border-default)] shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[var(--text-tertiary)] tracking-widest mb-3">
                {stat.label}
              </span>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-extrabold text-[var(--text-primary)] leading-none">{stat.val}</span>
                <span className={`text-[10px] font-bold mb-0.5 ${stat.c}`}>{stat.up}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Domains */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <Zap className="h-5 w-5 text-[var(--brand-primary)]" /> Trending Domains
            </h2>
            <button className="text-[10px] font-bold text-[var(--text-tertiary)] hover:text-[var(--text-primary)] uppercase tracking-wider">View All</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { name: "Generative Video", sigs: "342", active: true },
              { name: "Edge Computing", sigs: "128", active: false },
              { name: "Bio-Tech SaaS", sigs: "89", active: false },
              { name: "Climate Tech", sigs: "211", active: false },
              { name: "Fintech Infrastructure", sigs: "45", active: false },
            ].map((d, i) => (
              <button 
                key={i} 
                onClick={() => handleAnalyze(d.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs transition-all ${d.active ? 'bg-[var(--brand-primary-light)] border-[var(--brand-primary)] text-[var(--brand-primary)]' : 'bg-white border-[var(--border-default)] text-[var(--text-primary)] hover:bg-slate-50'}`}
              >
                <span className="font-bold">{d.name}</span>
                <span className={`text-[10px] ${d.active ? 'text-[var(--brand-primary)] opacity-80' : 'text-[var(--text-tertiary)]'}`}>{d.sigs} Signals</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recently Analyzed */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] mb-4">
            <Activity className="h-5 w-5 text-[var(--brand-primary)]" /> Recently Analyzed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loadingHistory ? (
              [1,2,3].map(i => <div key={i} className="h-48 bg-white border border-[var(--border-default)] rounded-xl animate-pulse" />)
            ) : trackedCompanies.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] italic col-span-3">No recent analysis found.</p>
            ) : (
              trackedCompanies.slice(0, 3).map((c, i) => {
                const badges = [
                  { label: "HIGH VELOCITY", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                  { label: "BREAKOUT", bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500" },
                  { label: "STABLE GROWTH", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
                ];
                const badge = badges[i % badges.length];
                const points = [
                  "0,20 25,15 50,18 75,5 100,0",
                  "0,30 25,25 50,15 75,10 100,5",
                  "0,25 25,20 50,22 75,15 100,10"
                ];

                return (
                  <Link 
                    href={`/dashboard/profile/${c.id}`} 
                    key={c.id}
                    className="bg-white border border-[var(--border-default)] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between h-48"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-primary)] text-sm shadow-sm">
                          {c.company_name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badge.bg}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${badge.text}`}>{badge.label}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)] text-base truncate">{c.company_name || c.company_domain}</h3>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-2">
                        Financial infrastructure for the internet.
                      </p>
                    </div>

                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col gap-1 w-1/3">
                        <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Trajectory</span>
                        <svg viewBox="0 0 100 30" className="w-full h-6 overflow-visible">
                          <polyline 
                            points={points[i % points.length]} 
                            fill="none" 
                            stroke={badge.text.replace("text-", "")} 
                            className={badge.text}
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                          />
                        </svg>
                      </div>
                      <span className={`text-sm font-extrabold ${badge.text}`}>+{Math.floor(Math.random() * 100 + 10)}%</span>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Last Signal</span>
                        <span className="text-[11px] font-bold text-[var(--text-primary)]">{Math.floor(Math.random() * 50 + 1)}m ago</span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Market Signals */}
      <div className="w-80 border-l border-[var(--border-default)] bg-white flex flex-col h-full flex-shrink-0">
        <div className="p-6 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Market Signals</h2>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1">Live Insight Feed</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Signal Item 1 */}
          <div className="rounded-xl border border-[var(--border-default)] bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">High Growth Alert</span>
                </div>
              </div>
              <p className="text-xs font-semibold text-[var(--text-primary)] leading-relaxed mb-4">
                Spatial Computing demand surged by 420% in the last 24 hours.
              </p>
              <button className="w-full bg-[var(--brand-primary-light)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1">
                Explore Sector <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Signal Item 2 */}
          <div className="rounded-xl border-l-2 border-l-blue-500 border border-[var(--border-default)] bg-white p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Funding</span>
              <span className="text-[9px] text-[var(--text-tertiary)] font-medium">3m ago</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)] font-bold">Neuralink</strong> raised $200M in Series D round led by Founders Fund.
            </p>
          </div>

          {/* Signal Item 3 */}
          <div className="rounded-xl border-l-2 border-l-indigo-500 border border-[var(--border-default)] bg-white p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-indigo-600 tracking-wider">Hiring Signal</span>
              <span className="text-[9px] text-[var(--text-tertiary)] font-medium">12m ago</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">
              <strong className="text-[var(--text-primary)] font-bold">Mistral AI</strong> added 14 new AI Engineers to their Paris hub.
            </p>
            <svg viewBox="0 0 100 15" className="w-full h-4 overflow-visible opacity-60">
              <path d="M0,10 Q25,-5 50,10 T100,5" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Signal Item 4 */}
          <div className="rounded-xl border-l-2 border-l-emerald-500 border border-[var(--border-default)] bg-white p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Tech Trend</span>
              <span className="text-[9px] text-[var(--text-tertiary)] font-medium">45m ago</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Open source repo <strong className="text-[var(--text-primary)] font-bold">PyTorch-Light</strong> star velocity +400%.
            </p>
          </div>

          {/* Signal Item 5 */}
          <div className="rounded-xl border-l-2 border-l-red-500 border border-[var(--border-default)] bg-white p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">Risk Alert</span>
              <span className="text-[9px] text-[var(--text-tertiary)] font-medium">1h ago</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Regulatory headwind detected for <strong className="text-[var(--text-primary)] font-bold">Crypto Exchanges</strong> in EU region.
            </p>
          </div>

        </div>
      </div>
      
    </div>
  );
}
