import Link from "next/link";
import { ArrowRight, BarChart3, Zap, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center pt-32 pb-20 px-6 sm:px-12 lg:px-24 text-center z-10">
        
        {/* Background Gradients */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"}}></div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Zap className="h-4 w-4" />
          <span>The Ultimate Lead Generation Engine</span>
        </div>

        <h1 className="max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          Analyze Any Company.<br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Generate Perfect Pitches.
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          Our elite AI system deeply scrapes the web, analyzes social footprints, and generates bespoke growth strategies so "Surge Startups" can close more deals.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Go to Dashboard
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link 
            href="/about"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm hover:shadow transition-all duration-300"
          >
            Learn How It Works
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-7xl px-6 sm:px-12 lg:px-24 py-24 z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Data Scraping</h3>
            <p className="text-slate-600 leading-relaxed">
              We use headless Playwright browsers to bypass JS barriers and scrape entire digital ecosystems.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Social Footprinting</h3>
            <p className="text-slate-600 leading-relaxed">
              Discover exactly what they are doing on LinkedIn, YouTube, and X before you ever make a cold call.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Bespoke Sales Pitches</h3>
            <p className="text-slate-600 leading-relaxed">
              Instantly generate tailored pitches explaining exactly how Surge Startups can fix their critical misses.
            </p>
          </div>
        </div>
      </section>
      
    </div>
  );
}
