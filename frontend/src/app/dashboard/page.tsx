"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  ChevronDown,
  Activity,
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
      <div className="flex-1 overflow-y-auto px-10 py-10 max-w-5xl mx-auto">
        
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
        </div>

        {/* Recently Analyzed */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)] mb-4">
            <Activity className="h-5 w-5 text-[var(--brand-primary)]" /> Recently Analyzed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {loadingHistory ? (
              [1,2,3].map(i => <div key={i} className="h-32 bg-white border border-[var(--border-default)] rounded-xl animate-pulse" />)
            ) : trackedCompanies.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] italic col-span-3">No recent analysis found.</p>
            ) : (
              trackedCompanies.map((c) => {
                return (
                  <Link 
                    href={`/dashboard/profile/${c.id}`} 
                    key={c.id}
                    className="bg-white border border-[var(--border-default)] rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] flex items-center justify-center font-bold text-[var(--text-primary)] text-sm shadow-sm">
                          {c.company_name?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{c.status || "Completed"}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-[var(--text-primary)] text-base truncate">{c.company_name || c.company_domain}</h3>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1 line-clamp-1">
                        {c.company_domain}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
