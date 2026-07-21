"use client";

import { useState } from "react";
import { Search, Filter, ArrowRight, History, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleSearch = async (tag?: string) => {
    const inputToUse = typeof tag === 'string' ? tag.trim() : query.trim();
    if (!inputToUse) return;
    
    try {
      if (typeof tag === 'string') setQuery(tag);
      setIsProcessing(true);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: inputToUse }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to start search");
      }
      
      const { job_id, company_id } = await res.json();
      router.push(`/dashboard/profile/${company_id}?job_id=${job_id}`);
    } catch (err: any) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center px-8 py-16 w-full max-w-5xl mx-auto animate-fade-in">
      <div className="w-full text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-[var(--text-primary)] font-serif italic">
          Advanced Search
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
          Deep-dive into our global index of companies. Filter by industry, region, tech stack, and more to uncover hidden signals.
        </p>
      </div>

      <div className="w-full relative mb-12">
        <div className="relative flex items-center bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--border-default)] focus-within:border-[var(--brand-primary)] focus-within:ring-1 focus-within:ring-[var(--brand-primary)] transition-all">
          <Search className="ml-6 h-6 w-6 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            disabled={isProcessing}
            placeholder="Search any company, domain, or keyword..."
            className="w-full pl-4 pr-32 py-5 outline-none text-lg font-medium text-[var(--text-primary)] disabled:opacity-50"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button className="flex items-center justify-center p-2 rounded-lg bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button 
              onClick={() => handleSearch()}
              disabled={isProcessing}
              className="flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:hover:bg-[var(--brand-primary)] min-w-[100px]"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Search <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-6">
          <History className="h-4 w-4 text-[var(--brand-primary)]" />
          Recent Searches
        </h3>
        <div className="flex flex-wrap gap-3">
          {["Pepul", "Cisco", "OpenAI", "Microsoft"].map((tag, i) => (
            <button 
              key={i} 
              onClick={() => handleSearch(tag)}
              disabled={isProcessing}
              className="px-4 py-2 rounded-full border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all disabled:opacity-50"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
