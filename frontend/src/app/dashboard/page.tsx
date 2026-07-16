"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight, Database, Search, Building2, Globe, ArrowUpRight } from "lucide-react";
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

  // Matched/recent companies states
  const [trackedCompanies, setTrackedCompanies] = useState<TrackedCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetchTrackedCompanies();
  }, []);

  const fetchTrackedCompanies = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("http://localhost:8000/api/v1/reports");
      if (res.ok) {
        const data = await res.json();
        setTrackedCompanies(data);
      }
    } catch (err) {
      console.error("Failed to load tracked companies history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAnalyze = async () => {
    if (!companyInput.trim()) return;
    try {
      setIsProcessing(true);
      setError(null);
      
      const res = await fetch("http://localhost:8000/api/v1/pipeline/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: companyInput.trim() }),
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to launch pipeline");
      }
      
      const { job_id, company_id } = await res.json();
      
      // Redirect to the progressive company profile immediately!
      router.push(`/dashboard/profile/${company_id}?job_id=${job_id}`);
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  const filteredCompanies = trackedCompanies.filter(c =>
    c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company_domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
      {/* Page Title */}
      <div className="mb-10 animate-in fade-in duration-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Startups Intelligence Platform</h1>
        <p className="text-slate-500 mt-2 font-medium">Auto-collect evidence, technology stacks, SEO audits, and financials for any company.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Columns: Search & Target Launch */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-md p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-50/50 rounded-full blur-3xl -z-10"></div>
            
            <h2 className="text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              Launch Intelligence Crawler
            </h2>
            <p className="text-slate-400 text-sm mb-6 font-medium">Enter a company name or website domain to start progressive multi-module collection.</p>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={companyInput}
                    onChange={(e) => setCompanyInput(e.target.value)}
                    disabled={isProcessing}
                    placeholder="e.g. apple.com or Tesla"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-800 font-bold placeholder-slate-400 outline-none transition-all disabled:opacity-50"
                    onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={isProcessing || !companyInput.trim()}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md shadow-indigo-150 transition-all disabled:opacity-50 min-w-[120px]"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Analyze
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
              
              {error && (
                <div className="text-rose-600 text-xs font-bold bg-rose-50 border border-rose-100 p-3 rounded-xl">
                  Error: {error}
                </div>
              )}
            </div>
          </div>

          {/* Quick Guides/Modules Map */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Website Crawler", desc: "HTML & Text parsing", color: "bg-blue-50 text-blue-600 border-blue-100" },
              { label: "Tech Detection", desc: "Software & CMS stacks", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
              { label: "SEO Audit", desc: "Metadata & indexing", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { label: "Speed & Performance", desc: "Vitals & compression", color: "bg-amber-50 text-amber-600 border-amber-100" },
              { label: "News & Reviews", desc: "Press updates & ratings", color: "bg-rose-50 text-rose-600 border-rose-100" },
              { label: "Hiring & Funding", desc: "Jobs & financial rounds", color: "bg-purple-50 text-purple-600 border-purple-100" },
            ].map((module, idx) => (
              <div key={idx} className={`p-4 border rounded-2xl flex flex-col justify-between h-28 ${module.color}`}>
                <span className="font-extrabold text-sm leading-tight">{module.label}</span>
                <span className="text-[10px] opacity-80 font-medium">{module.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Tracked Companies List */}
        <div className="lg:col-span-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 flex flex-col h-[520px]">
            <h3 className="text-lg font-extrabold text-slate-900 mb-2 flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-600" />
              Tracked Startups
            </h3>
            <p className="text-slate-400 text-xs font-semibold mb-4">View currently monitored profiles</p>
            
            {/* Filter Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter tracked startup..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl text-xs font-semibold placeholder-slate-400 outline-none transition-all"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
              ) : filteredCompanies.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center p-6">
                  <Building2 className="h-8 w-8 text-slate-300 mb-2" />
                  No companies matching filters.
                </div>
              ) : (
                filteredCompanies.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/profile/${c.id}`}
                    className="flex justify-between items-center p-4 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 rounded-2xl group transition-all"
                  >
                    <div className="overflow-hidden mr-3">
                      <h4 className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {c.company_name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <Globe className="h-3 w-3" />
                        {c.company_domain}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
