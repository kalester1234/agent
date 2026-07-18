"use client";

import { useState, useEffect } from "react";
import { Target, AlertTriangle, TrendingUp, Filter, Users, Database, Loader2 } from "lucide-react";

interface Opportunity {
  id: number;
  company_id: number;
  company_name: string;
  title: string;
  impact: string;
  type: string;
  desc: string;
}

interface PipelineStage {
  stage: string;
  count: number;
}

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/opportunities`);
        if (res.ok) {
          const data = await res.json();
          setOpportunities(data.opportunities);
          setPipeline(data.pipeline);
        }
      } catch (err) {
        console.error("Failed to fetch opportunities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => 
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIconConfig = (type: string, impact: string) => {
    if (type === "Strategic") return { icon: TrendingUp, color: "text-[#2E7D32]", bg: "bg-[#E8F5E9]" };
    if (type === "Defensive" || impact === "Critical") return { icon: AlertTriangle, color: "text-[#D32F2F]", bg: "bg-[#FFEBEE]" };
    return { icon: Database, color: "text-[var(--brand-primary)]", bg: "bg-[#F5F8FF]" };
  };

  return (
    <div className="flex flex-col px-8 py-10 w-full max-w-6xl mx-auto animate-fade-in">
      <div className="w-full flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-semibold mb-2 text-[var(--text-primary)]">
            Opportunity <span className="font-serif italic text-[var(--brand-primary)]">Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl">
            Visualizing high-impact business signals and AI-derived strategic interventions across your enterprise ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-default)] rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
            <Filter className="h-4 w-4" /> Filter Signals
          </button>
        </div>
      </div>

      <div className="w-full relative mb-12">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search opportunities, signals, or entities..."
          className="w-full px-6 py-4 rounded-xl border border-[var(--border-strong)] outline-none text-sm font-medium text-[var(--text-primary)] shadow-sm focus:border-[var(--brand-primary)] transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Top Strategic Opportunities */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-4">
            <Target className="h-4 w-4 text-[var(--brand-primary)]" />
            Top Strategic Opportunities
          </h3>

          {loading ? (
            <div className="p-8 flex justify-center text-[var(--brand-primary)]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredOpportunities.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[var(--border-default)] rounded-2xl shadow-sm text-[var(--text-secondary)]">
              No opportunities found matching your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOpportunities.map((opp) => {
                const config = getIconConfig(opp.type, opp.impact);
                const Icon = config.icon;
                return (
                  <div key={opp.id} className="p-6 bg-white border border-[var(--border-default)] rounded-2xl shadow-sm hover:shadow-md transition-shadow group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: opp.impact === 'Critical' ? '#D32F2F' : opp.impact === 'High' ? '#1976D2' : '#E0E0E0' }} />
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className={`p-3 rounded-xl flex-shrink-0 ${config.bg} ${config.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                            {opp.type}
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-tertiary)] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            {opp.impact} Impact
                          </span>
                          <span className="text-xs font-bold text-[var(--brand-primary)] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {opp.company_name}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                          {opp.title}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {opp.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Opportunity Pipeline & Insights */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-white border border-[var(--border-default)] rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--brand-primary)]" />
              Opportunity Pipeline
            </h3>
            <div className="space-y-4 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[var(--border-default)] z-0"></div>
              {loading ? (
                <div className="flex justify-center text-[var(--brand-primary)] py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : pipeline.map((pipe, i) => (
                <div key={i} className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-5 w-5 rounded-full border-4 border-white bg-[var(--brand-primary)] flex-shrink-0"></div>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{pipe.stage}</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--text-secondary)]">{pipe.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--surface-subtle)] border border-[var(--brand-primary-light)] rounded-2xl p-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--brand-primary)] mb-2">
              AI Sales Strategy
            </h4>
            <p className="text-xs font-medium text-[var(--text-secondary)] leading-relaxed mb-4">
              Focus your enterprise outreach on the 14 targets currently in the Strategy phase. They have a 78% higher conversion probability based on recent AI market signals.
            </p>
            <button className="w-full py-2 bg-white border border-[var(--border-default)] rounded-lg text-xs font-bold text-[var(--text-primary)] hover:border-[var(--brand-primary)] transition-colors">
              Generate Outreach Report
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
