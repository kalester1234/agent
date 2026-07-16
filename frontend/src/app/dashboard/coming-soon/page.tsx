import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] px-6 text-center">
      <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <Clock className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Feature in Development</h1>
      <p className="text-slate-600 max-w-md mb-10 text-lg">
        This section of the Surge Startups Intelligence Engine is currently being built. We are rolling out updates rapidly.
      </p>
      <Link 
        href="/dashboard"
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
