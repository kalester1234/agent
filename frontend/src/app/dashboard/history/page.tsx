"use client";

import { useEffect, useState } from "react";
import { Clock, ExternalLink, RefreshCcw, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";

interface TrackedCompany {
  id: number;
  company_name: string;
  company_domain: string;
  created_at: string;
  status: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<TrackedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete === null) return;
    const id = itemToDelete;
    try {
      setDeletingId(id);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/reports/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setHistory(prev => prev.filter(item => item.id !== id));
      } else {
        alert("Failed to delete report.");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("Error deleting report.");
    } finally {
      setDeletingId(null);
      setItemToDelete(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="px-8 py-10 w-full max-w-6xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[var(--text-primary)] mb-1">
            Analysis History
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Review all previously executed intelligence gathering pipelines.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border-default)] rounded-lg text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-subtle)] transition-colors">
          <RefreshCcw className="h-4 w-4" /> Refresh Data
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border-default)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--surface-subtle)] border-b border-[var(--border-default)]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Company</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Domain</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Date Executed</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)] text-sm font-medium">
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-tertiary)] text-sm font-medium">
                    No analysis history found. Run a new search to get started.
                  </td>
                </tr>
              ) : (
                history.map((item, i) => (
                  <tr key={item.id} className="hover:bg-[#F5F8FF] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-default)] flex items-center justify-center text-xs font-bold text-[var(--text-primary)]">
                          {(item.company_name || item.company_domain).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {item.company_name || "Unknown Entity"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-secondary)]">
                      {item.company_domain}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[var(--text-tertiary)]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                        ${item.status === 'completed' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 
                          item.status === 'failed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link 
                          href={`/dashboard/profile/${item.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:text-blue-800 transition-colors"
                        >
                          View Report <ExternalLink className="h-3 w-3" />
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Delete Report"
                        >
                          {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-[var(--border-default)] w-full max-w-md overflow-hidden animate-scale-in">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Delete Analysis Report</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                Are you sure you want to permanently delete this report and all of its associated data? This action cannot be undone.
              </p>
            </div>
            <div className="bg-[var(--surface-subtle)] px-6 py-4 flex items-center justify-end gap-3 border-t border-[var(--border-default)]">
              <button 
                onClick={() => setItemToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={deletingId !== null}
                className="flex items-center justify-center min-w-[100px] px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-70"
              >
                {deletingId !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
