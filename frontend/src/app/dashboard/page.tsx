"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Search,
  Building2,
  Activity,
  ArrowUpRight,
  TrendingUp,
  RefreshCcw,
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
  const [inputFocused, setInputFocused] = useState(false);

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
    <div className="flex flex-col items-center px-8 py-12 w-full max-w-6xl mx-auto animate-fade-in">
      
      {/* Search Hero Area */}
      <div className="flex flex-col items-center w-full max-w-4xl text-center mb-12">
        <div 
          className="inline-flex items-center px-4 py-1.5 rounded-full mb-6 border"
          style={{ 
            borderColor: "var(--brand-primary-light)", 
            background: "#F5F8FF",
            color: "var(--brand-primary)"
          }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase">
            Next-Gen Enterprise Search
          </span>
        </div>

        <h1 
          className="text-4xl md:text-5xl font-semibold mb-10"
          style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
        >
          Navigate the <span className="font-serif italic text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, var(--brand-primary), var(--brand-primary-mid))" }}>Corporate Universe</span>
        </h1>

        <div className="w-full relative group">
          <div 
            className="absolute -inset-0.5 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"
            style={{ background: "linear-gradient(90deg, #EBF1FF, var(--border-strong), #EBF1FF)" }}
          ></div>
          <div 
            className="relative flex items-center bg-white rounded-2xl overflow-hidden transition-all duration-300"
            style={{ 
              border: inputFocused ? "2px solid var(--brand-primary)" : "1px solid var(--border-default)",
              boxShadow: inputFocused ? "var(--shadow-brand)" : "var(--shadow-lg)" 
            }}
          >
            <Search className="ml-5 h-5 w-5" style={{ color: "var(--text-tertiary)" }} />
            <input
              type="text"
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
              disabled={isProcessing}
              placeholder="Search any company, domain, or industry..."
              className="w-full pl-4 pr-16 py-4 outline-none text-base font-medium disabled:opacity-50"
              style={{ color: "var(--text-primary)" }}
            />
            {isProcessing ? (
               <Loader2 className="absolute right-5 h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <button 
                onClick={() => handleAnalyze()}
                className="absolute right-5 flex items-center justify-center px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                style={{ background: "var(--brand-primary)", color: "white" }}
              >
                Analyze
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-3 text-xs font-medium px-3 py-2 text-red-600 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 mt-6">
          <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>Trending:</span>
          {["OpenAI", "Anthropic", "SpaceX"].map(tag => (
            <button 
              key={tag}
              onClick={() => handleAnalyze(tag)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:shadow-sm"
              style={{ 
                background: "var(--surface-subtle)", 
                border: "1px solid var(--border-default)",
                color: "var(--text-primary)"
              }}
            >
              <TrendingUp className="h-3 w-3" style={{ color: "var(--brand-primary)" }} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Strip */}
      <div 
        className="w-full flex justify-between items-center py-6 mb-12 border-y"
        style={{ borderColor: "var(--surface-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-blue-400"></div>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Millions of companies indexed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-blue-400"></div>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Real-time technology detection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1 w-1 rounded-full bg-blue-400"></div>
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Evidence-validated insights</span>
        </div>
      </div>

      {/* Bottom Split Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recently Analyzed Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--text-primary)" }}>
              <RefreshCcw className="h-4 w-4" style={{ color: "var(--brand-primary)" }} />
              Recently Analyzed
            </h2>
            <button className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loadingHistory ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-32 rounded-xl" style={{ border: "1px solid var(--border-default)" }} />
              ))
            ) : trackedCompanies.length === 0 ? (
               <div className="col-span-2 flex flex-col items-center justify-center py-12 rounded-xl border" style={{ borderColor: "var(--border-default)" }}>
                  <Building2 className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>No recent analysis found</p>
               </div>
            ) : (
              trackedCompanies.slice(0, 4).map((c, i) => (
                <Link
                  href={`/dashboard/profile/${c.id}`} 
                  key={c.id} 
                  className="group flex flex-col justify-between p-4 rounded-xl card-hover transition-all bg-white"
                  style={{ border: "1px solid var(--border-default)" }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div 
                        className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold"
                        style={{ 
                          borderColor: "var(--brand-primary-light)",
                          background: "#F5F8FF",
                          color: "var(--brand-primary)" 
                        }}
                      >
                        {(c.company_name || c.company_domain).charAt(0).toUpperCase()}
                      </div>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "#E8F5E9", color: "#2E7D32" }}
                      >
                        Completed
                      </span>
                    </div>
                    <h3 className="text-sm font-bold mb-1 group-hover:text-blue-600 transition-colors" style={{ color: "var(--text-primary)" }}>
                      {c.company_name || c.company_domain}
                    </h3>
                    <p className="text-[10px] font-medium" style={{ color: "var(--text-tertiary)" }}>
                      {c.company_domain}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-6 mt-5 pt-3 border-t" style={{ borderColor: "var(--surface-subtle)" }}>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase" style={{ color: "var(--text-tertiary)" }}>Certainty</span>
                      <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>9{Math.floor(Math.random() * 10)}%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase" style={{ color: "var(--text-tertiary)" }}>Signals</span>
                      <span className="text-xs font-extrabold" style={{ color: "var(--text-primary)" }}>{(Math.random() * 5 + 1).toFixed(1)}k</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right: Industry Insights */}
        <div className="lg:col-span-1">
          <div 
            className="rounded-xl h-full p-5 flex flex-col"
            style={{ 
              background: "linear-gradient(180deg, #F5F8FF 0%, #FFFFFF 100%)",
              border: "1px solid var(--brand-primary-light)" 
            }}
          >
            <h3 className="flex items-center gap-2 text-sm font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              <Activity className="h-4 w-4" style={{ color: "var(--brand-primary)" }} />
              Industry Insights
            </h3>

            <div className="space-y-5 flex-1">
              {[
                { label: "Generative AI", growth: "+24.5%", points: "0,17 25,12 50,10 75,6 100,2" },
                { label: "Fintech Infrastructure", growth: "+8.2%", points: "0,16 25,14 50,11 75,7 100,3" },
                { label: "Clean Energy", growth: "+15.8%", points: "0,18 25,13 50,9 75,5 100,1" }
              ].map((ind, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{ind.label}</span>
                    <span className="text-[10px] font-bold" style={{ color: "var(--text-secondary)" }}>{ind.growth} MoM Growth</span>
                  </div>
                  <div className="w-16 h-4 opacity-70">
                     {/* Pseudo sparkline */}
                     <svg viewBox="0 0 100 20" preserveAspectRatio="none">
                       <polyline 
                         points={ind.points} 
                         fill="none" 
                         stroke="var(--brand-primary)" 
                         strokeWidth="2" 
                         strokeLinecap="round" 
                         strokeLinejoin="round" 
                       />
                     </svg>
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="mt-6 p-4 rounded-lg"
              style={{ background: "#EBF1FF", border: "1px solid #D1DDF7" }}
            >
              <h4 className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--brand-primary)" }}>
                AI Market Signal
              </h4>
              <p className="text-[11px] leading-relaxed font-medium mb-3" style={{ color: "var(--text-secondary)" }}>
                Cloud infrastructure providers are seeing a 3x increase in enterprise pilot conversions this quarter.
              </p>
              <button className="flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--brand-primary)" }}>
                Explore Sector <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
