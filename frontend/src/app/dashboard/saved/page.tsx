"use client";

import { Bookmark, Building2, MoreHorizontal, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SavedCompaniesPage() {
  const [savedCompanies, setSavedCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports`)
      .then((res) => res.json())
      .then((data) => {
        setSavedCompanies(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch saved companies", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="px-8 py-10 w-full max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-1">
            Saved Companies
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Profiles and signals you have bookmarked for continuous tracking.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-subtle)] border border-[var(--border-default)] rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-slate-100 transition-colors">
          <Bookmark className="h-4 w-4" /> Export List
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
          </div>
        ) : (
          savedCompanies.map((company, i) => (
            <div key={i} className="bg-white border border-[var(--border-default)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group relative">
            <button className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-[#F5F8FF] border border-[var(--brand-primary-light)] text-[var(--brand-primary)] flex items-center justify-center font-bold text-lg">
                {company.company_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-[var(--text-primary)] text-lg">{company.company_name}</h3>
                <p className="text-xs font-medium text-[var(--text-tertiary)]">{company.company_domain}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-[var(--surface-subtle)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                {company.status === "completed" ? "Tracked" : "Crawling"}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-tertiary)]">
                {new Date(company.created_at).toLocaleDateString()}
              </span>
            </div>

            <Link href={`/dashboard/profile/${company.id}`} className="absolute inset-0 z-0">
              <span className="sr-only">View profile</span>
            </Link>
          </div>
          ))
        )}
        
        {/* Empty State / Add New */}
        <Link 
          href="/dashboard"
          className="border-2 border-dashed border-[var(--border-strong)] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[var(--surface-subtle)] hover:border-[var(--brand-primary-light)] transition-colors min-h-[200px] group"
        >
          <Building2 className="h-8 w-8 text-[var(--text-tertiary)] group-hover:text-[var(--brand-primary)] transition-colors mb-3" />
          <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">Track New Company</p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Search the index to add more.</p>
        </Link>
      </div>
    </div>
  );
}
