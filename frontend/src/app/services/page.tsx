import Link from "next/link";
import { ArrowRight, Code, Megaphone, TrendingUp, Search } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50 overflow-hidden py-24 px-6 sm:px-12 lg:px-24">
      <div className="max-w-4xl w-full text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
          Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Services</span>
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
          When the Surge Startups Intelligence Engine identifies a weakness in a prospect's business, we step in to execute the solution. Here is how we help SMBs grow.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl w-full mb-20">
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div className="h-14 w-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 ring-4 ring-blue-100">
            <Search className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Deep Technical SEO Audits</h3>
          <p className="text-slate-600 mb-6">
            If our AI flags that a company has poor web optimization, we deploy our elite SEO agents to restructure their site map, improve Core Web Vitals, and dominate search rankings.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div> PageSpeed Optimization</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Semantic HTML Structuring</li>
          </ul>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
          <div className="h-14 w-14 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center mb-6 ring-4 ring-violet-100">
            <Code className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Web & App Modernization</h3>
          <p className="text-slate-600 mb-6">
            Outdated tech stacks lose customers. We rebuild SMB landing pages and apps using React, Next.js, and modern UX patterns to instantly boost conversion rates.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-violet-500"></div> Next.js Migration</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-violet-500"></div> High-Converting UI/UX</li>
          </ul>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
          <div className="h-14 w-14 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6 ring-4 ring-orange-100">
            <Megaphone className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">B2B Lead Generation</h3>
          <p className="text-slate-600 mb-6">
            If their marketing team is weak, we implement our bespoke outbound sales pipeline. We define their Ideal Customer Profile and automate their outreach.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Automated Cold Emailing</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-orange-500"></div> LinkedIn Outreach</li>
          </ul>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-sm border border-slate-200 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6 ring-4 ring-emerald-100">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Growth Consulting</h3>
          <p className="text-slate-600 mb-6">
            We offer fractional CMO and CTO services to guide startups through the turbulent waters of scaling from 10 to 100 employees.
          </p>
          <ul className="space-y-3 text-sm text-slate-700 font-medium">
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Fractional CTO</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> KPI Tracking & OKRs</li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
        <p className="text-slate-500 mb-4 text-center">Ready to find a prospect to sell these services to?</p>
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
        >
          Use the Intelligence Engine
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
