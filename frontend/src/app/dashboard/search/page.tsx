"use client";

import { useState } from "react";
import { Search, Filter, ArrowRight, History } from "lucide-react";

export default function SearchPage() {
  const [query, setQuery] = useState("");

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
        <div className="relative flex items-center bg-white rounded-2xl overflow-hidden shadow-lg border border-[var(--border-default)]">
          <Search className="ml-6 h-6 w-6 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any company, domain, or keyword..."
            className="w-full pl-4 pr-32 py-5 outline-none text-lg font-medium text-[var(--text-primary)]"
          />
          <div className="absolute right-3 flex items-center gap-2">
            <button className="flex items-center justify-center p-2 rounded-lg bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Filter className="h-5 w-5" />
            </button>
            <button className="flex items-center justify-center px-4 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-sm font-bold hover:bg-blue-700 transition-colors">
              Search <ArrowRight className="ml-2 h-4 w-4" />
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
          {["Fintech API Providers", "Germany Clean Energy", "Series B AI Startups", "Healthcare SaaS in NY"].map((tag, i) => (
            <button key={i} className="px-4 py-2 rounded-full border border-[var(--border-default)] bg-white text-xs font-semibold text-[var(--text-secondary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
