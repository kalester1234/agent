import Link from "next/link";
import { ArrowRight, Globe, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50 overflow-hidden py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl w-full text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          About <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Surge Startups</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
          We are an elite agency focused on identifying massive growth opportunities for SMBs using advanced AI web scraping and social footprint analysis.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full mb-20">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="h-14 w-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 ring-4 ring-indigo-100">
            <Globe className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Global Reach</h3>
          <p className="text-slate-600">
            Our AI scans digital ecosystems across the globe, allowing us to find prospects anywhere, anytime.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="h-14 w-14 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mb-6 ring-4 ring-violet-100">
            <Target className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Precision Targeting</h3>
          <p className="text-slate-600">
            We don't just find companies. We find their exact weaknesses—poor tech, weak marketing—so we know how to pitch them.
          </p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="h-14 w-14 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-6 ring-4 ring-pink-100">
            <Users className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Surge Startups Initiative</h3>
          <p className="text-slate-600">
            Our goal is to scale early-stage SMBs into massive enterprises using our proprietary Intelligence Engine.
          </p>
        </div>
      </div>
      
      <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-3xl p-10 md:p-16 text-center max-w-4xl w-full shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white opacity-5"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-white opacity-5"></div>
        
        <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Ready to See the Engine in Action?</h2>
        <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto relative z-10">
          Try generating a report for any domain right now to see how our AI breaks down their entire business model.
        </p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg shadow-sm transition-colors relative z-10"
        >
          Go to Dashboard
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
