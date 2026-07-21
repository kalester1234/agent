"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Bell, HelpCircle, Settings, Globe, Menu, X } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--surface-subtle)" }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="relative w-[240px] h-full bg-white shadow-xl flex flex-col z-50">
            <button className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-4 w-4" />
            </button>
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header
          className="flex h-[72px] items-center justify-between px-4 md:px-8 flex-shrink-0"
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <button className="md:hidden p-1.5 hover:bg-slate-200 rounded-md transition-colors" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5 text-slate-700" />
            </button>
            <Globe className="hidden sm:block h-4 w-4" />
            <span className="text-xs font-medium truncate hidden sm:block">Global Market Intelligence</span>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5" style={{ color: "var(--text-primary)" }}>
            <button className="hover:opacity-70 transition-opacity hidden sm:block">
              <Bell className="h-5 w-5" />
            </button>
            <button className="hover:opacity-70 transition-opacity hidden sm:block">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Avatar Placeholder */}
            <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
              <span className="text-xs font-bold text-slate-500">U</span>
            </div>
          </div>
        </header>

        {/* Separator */}
        <div className="px-4 md:px-8 w-full">
          <div style={{ height: "1px", background: "var(--border-default)" }}></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scroll-pt-[100px]">
          {children}
        </main>
      </div>
    </div>
  );
}
