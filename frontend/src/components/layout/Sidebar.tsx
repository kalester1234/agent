import Link from "next/link";
import { LayoutDashboard, FileText, Bookmark, BarChart2, MessageSquare, Download, Settings, CreditCard } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'New Analysis', href: '/dashboard', icon: BarChart2 },
  { name: 'Reports', href: '/dashboard/coming-soon', icon: FileText },
  { name: 'Saved Companies', href: '/dashboard/coming-soon', icon: Bookmark },
  { name: 'Compare', href: '/dashboard/coming-soon', icon: LayoutDashboard },
  { name: 'AI Chat', href: '/dashboard/coming-soon', icon: MessageSquare },
  { name: 'Exports', href: '/dashboard/coming-soon', icon: Download },
];

const secondaryNavigation = [
  { name: 'Workspace', href: '/dashboard/coming-soon', icon: LayoutDashboard },
  { name: 'Billing', href: '/dashboard/coming-soon', icon: CreditCard },
  { name: 'Settings', href: '/dashboard/coming-soon', icon: Settings },
];

export default function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black tracking-tighter text-sm">
            S
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            Surge Startups
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <nav className="flex-1 space-y-1 px-4 py-4">
          <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Main</p>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </Link>
            );
          })}
          
          <div className="mt-8 mb-2">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Workspace</p>
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
