import { ReactNode } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Bell, HelpCircle, Settings, Globe } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header
          className="flex h-[72px] items-center justify-between px-8 flex-shrink-0"
        >
          <div className="flex items-center gap-2" style={{ color: "var(--text-secondary)" }}>
            <Globe className="h-4 w-4" />
            <span className="text-xs font-medium">Global Market Intelligence</span>
          </div>
          
          <div className="flex items-center gap-5" style={{ color: "var(--text-primary)" }}>
            <button className="hover:opacity-70 transition-opacity">
              <Bell className="h-5 w-5" />
            </button>
            <button className="hover:opacity-70 transition-opacity">
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
        <div className="px-8 w-full">
          <div style={{ height: "1px", background: "var(--border-default)" }}></div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
