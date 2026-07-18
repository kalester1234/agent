"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Bookmark,
  Clock,
  Target,
  Plus
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Search", href: "/dashboard/search", icon: Search },
  { name: "Saved Companies", href: "/dashboard/saved", icon: Bookmark },
  { name: "Analysis History", href: "/dashboard/history", icon: Clock },
  { name: "Opportunity Radar", href: "/dashboard/opportunities", icon: Target },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div
      className="flex h-full flex-col border-r"
      style={{
        width: "240px",
        minWidth: "240px",
        background: "#FFFFFF",
        borderColor: "var(--border-default)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0"
          style={{ background: "var(--brand-primary)" }}
        ></div>
        <div className="flex flex-col">
          <span
            className="text-base font-bold leading-tight"
            style={{ color: "var(--brand-primary)", letterSpacing: "-0.01em" }}
          >
            SurgeStartups
          </span>
          <span
            className="text-[10px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Intelligence Engine
          </span>
        </div>
      </div>

      {/* Nav */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-2 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href + "/"));

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                background: isActive ? "var(--brand-primary-light)" : "transparent",
                color: isActive ? "var(--brand-primary)" : "var(--text-secondary)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "var(--surface-subtle)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon
                className="h-4 w-4 flex-shrink-0"
                style={{ strokeWidth: 2 }}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Button */}
      <div className="px-4 py-5">
        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-mid)] transition-colors duration-150 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Analysis
        </Link>
      </div>
    </div>
  );
}
