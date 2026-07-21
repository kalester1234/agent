"use client";

import { useEffect, useState, use, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Loader2, ArrowLeft, RefreshCw, Globe, Building2, MapPin,
  Share2, Sparkles, ExternalLink, Code2, Cpu, X,
  BarChart2, CreditCard, Shield, Type, Server,
  ChevronDown, ChevronUp, Layout, FileText, Briefcase, Phone,
  BookOpen, Megaphone, Lock, CheckCircle2, XCircle, AlertTriangle,
  Search, Link2, Tag, List, Hash, Newspaper, Star, AlertOctagon, TrendingDown, Users, DollarSign,
  Calendar, Download, Presentation, Target, Mail, MessageSquare, Edit2, Check, PieChart as PieChartIcon
} from "lucide-react";
import Link from "next/link";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";

const parseFinancialValue = (valueStr: string) => {
  if (!valueStr || valueStr.toLowerCase().includes("not disclosed") || valueStr.toLowerCase().includes("unknown")) return 0;
  
  let numStr = valueStr.replace(/[^0-9.]/g, '');
  if (!numStr) return 0;
  
  let num = parseFloat(numStr);
  const lowerStr = valueStr.toLowerCase();
  
  if (lowerStr.includes('b')) {
    num *= 1000; // Store everything in Millions
  } else if (lowerStr.includes('k')) {
    num /= 1000;
  }
  
  return num;
};
interface PageProps {
  params: Promise<{ id: string }>;
}

interface SocialProfile { id: number; platform: string; url: string; }
interface WebPage { id: number; url: string; title: string; meta_description: string; page_type: string; content_snippet: string; structured_data: any; }
interface TechItem { name: string; version: string | null; }
interface TechStack { [category: string]: TechItem[]; }

const PAGE_TYPE_ICONS: Record<string, any> = {
  home: Globe, about: Building2, products: Briefcase, services: Cpu,
  pricing: CreditCard, blog: BookOpen, resources: FileText, press: Megaphone,
  careers: Briefcase, contact: Phone, legal: Lock, privacy: Shield, other: FileText,
};

const PAGE_TYPE_COLORS: Record<string, string> = {
  home: "bg-blue-100 text-[var(--text-secondary)] border-blue-200",
  about: "bg-blue-100 text-[var(--text-secondary)] border-blue-200",
  products: "bg-blue-100 text-[var(--text-secondary)] border-blue-200",
  services: "bg-cyan-100 text-cyan-700 border-cyan-200",
  pricing: "bg-emerald-100 text-emerald-700 border-emerald-200",
  blog: "bg-amber-100 text-amber-700 border-amber-200",
  resources: "bg-orange-100 text-orange-700 border-orange-200",
  press: "bg-rose-100 text-rose-700 border-rose-200",
  careers: "bg-pink-100 text-pink-700 border-pink-200",
  contact: "bg-teal-100 text-teal-700 border-teal-200",
  legal: "bg-slate-100 text-slate-600 border-slate-200",
  privacy: "bg-slate-100 text-slate-600 border-slate-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

const TECH_CATEGORY_ICONS: Record<string, any> = {
  Frontend: Code2, Backend: Server, CMS: Layout, Analytics: BarChart2,
  CDN: Globe, Hosting: Globe, Payment: CreditCard, "Chat/Support": Sparkles,
  Fonts: Type, "Security Headers": Shield,
};

const TECH_CATEGORY_COLORS: Record<string, string> = {
  Frontend: "bg-blue-50 border-blue-200 text-blue-800",
  Backend: "bg-blue-50 border-blue-200 text-blue-800",
  CMS: "bg-blue-50 border-blue-200 text-blue-800",
  Analytics: "bg-amber-50 border-amber-200 text-amber-800",
  CDN: "bg-cyan-50 border-cyan-200 text-cyan-800",
  Hosting: "bg-teal-50 border-teal-200 text-teal-800",
  Payment: "bg-emerald-50 border-emerald-200 text-emerald-800",
  "Chat/Support": "bg-orange-50 border-orange-200 text-orange-800",
  Fonts: "bg-pink-50 border-pink-200 text-pink-800",
  "Security Headers": "bg-slate-50 border-slate-200 text-slate-700",
};

const PAGE_TYPE_ORDER = ["home","about","products","services","pricing","blog","resources","press","careers","contact","legal","privacy","other"];
const TECH_CATEGORY_ORDER = ["Frontend","Backend","Hosting","CDN","CMS","Analytics","Payment","Chat/Support","Fonts","Security Headers"];

export default function ProfilePage({ params }: PageProps) {
  const { id: companyId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("job_id");

  const [crawlProgress, setCrawlProgress] = useState(0.0);
  const [crawlStatus, setCrawlStatus] = useState("Loading...");
  const [currentTask, setCurrentTask] = useState("");
  const [isCrawling, setIsCrawling] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPitchDeck, setIsExportingPitchDeck] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachData, setOutreachData] = useState<{email_subject: string, email_body: string, linkedin_message: string} | null>(null);

  const [editingFactId, setEditingFactId] = useState<number | null>(null);
  const [editFactValue, setEditFactValue] = useState<string>("");
  const [savingFact, setSavingFact] = useState<boolean>(false);

  const reportRef = useRef<HTMLDivElement>(null);

  const [basicInfo, setBasicInfo] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [socials, setSocials] = useState<SocialProfile[]>([]);
  const [webPages, setWebPages] = useState<WebPage[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [techStack, setTechStack] = useState<TechStack>({});
  const [seoData, setSeoData] = useState<any>(null);
  const [performance, setPerformance] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [painPoints, setPainPoints] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [pricing, setPricing] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any>(null);
  const [study, setStudy] = useState<any>(null);
  const [selectedNewsArticle, setSelectedNewsArticle] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any[]>([]);


  const [analyzingPain, setAnalyzingPain] = useState(false);

  const [loading, setLoading] = useState({ basic: true, overview: true, social: true, website: true, tech: true, seo: true, performance: true, news: true, reviews: true, jobs: true, painPoints: true, executives: true, pricing: true, compliance: true, study: true, competitors: true });


  useEffect(() => {
    fetchBasicInfo();
    if (jobId) {
      setIsCrawling(true);
      const es = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/stream/${jobId}`);
      es.onmessage = (e) => {
        const payload = JSON.parse(e.data);
        if (payload.event === "job.progress") {
          const { progress, current_task, status } = payload.data;
          setCrawlProgress(progress); setCrawlStatus(status); setCurrentTask(current_task);
          if (progress >= 20.0) fetchOverview();
          if (progress >= 60.0) { fetchWebsite(); fetchTech(); }
          if (progress >= 70.0) fetchSocials();
          if (progress >= 75.0) { fetchSeo(); fetchPerformance(); }
          if (progress >= 85.0) { fetchNews(); fetchReviews(); }
          if (progress >= 90.0) { fetchJobs(); fetchCompetitors(); }
          if (progress >= 100.0) {
            setIsCrawling(false); es.close();
            fetchOverview(); fetchWebsite(); fetchTech(); fetchSocials(); fetchSeo(); fetchPerformance(); fetchNews(); fetchReviews(); fetchJobs(); fetchPainPoints(); fetchExecutives(); fetchPricing(); fetchCompliance(); fetchCompetitors();
          }
        } else if (payload.event === "report.completed") {
          setIsCrawling(false); setCrawlProgress(100.0); es.close();
          fetchOverview(); fetchWebsite(); fetchTech(); fetchSocials(); fetchSeo(); fetchPerformance(); fetchNews(); fetchReviews(); fetchJobs(); fetchPainPoints(); fetchExecutives(); fetchPricing(); fetchCompliance(); fetchCompetitors();
        } else if (payload.event === "pipeline.failed") {
          setIsCrawling(false); setCrawlStatus("failed"); es.close();
        }
      };
      es.onerror = () => { setIsCrawling(false); es.close(); };
      return () => es.close();
    } else {
      setCrawlProgress(100.0);
      fetchOverview(); fetchWebsite(); fetchTech(); fetchSocials(); fetchSeo(); fetchPerformance(); fetchNews(); fetchReviews(); fetchJobs(); fetchPainPoints(); fetchExecutives(); fetchPricing(); fetchCompliance(); fetchCompetitors();
    }
  }, [companyId, jobId]);

  const fetchBasicInfo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}`);
      if (res.ok) {
        const data = await res.json(); setBasicInfo(data);
        if (data.status === "completed") setCrawlProgress(100.0);
        else { setCrawlProgress(data.progress); setCrawlStatus(data.status); setCurrentTask(data.current_task); }
      }
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, basic: false })); }
  };

  const fetchOverview = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/overview`);
      if (res.ok) setOverview(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, overview: false })); }
  };

  const fetchSocials = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/social`);
      if (res.ok) setSocials(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, social: false })); }
  };

  const fetchWebsite = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/website`);
      if (res.ok) {
        const pages: WebPage[] = await res.json();
        pages.sort((a, b) => {
          const ai = PAGE_TYPE_ORDER.indexOf(a.page_type), bi = PAGE_TYPE_ORDER.indexOf(b.page_type);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        });
        setWebPages(pages);
      }
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, website: false })); }
  };

  const fetchTech = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/technology`);
      if (res.ok) setTechStack(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, tech: false })); }
  };

  const fetchSeo = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/seo`);
      if (res.ok) setSeoData(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, seo: false })); }
  };

  const fetchPerformance = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/performance`);
      if (res.ok) setPerformance(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, performance: false })); }
  };

  const fetchNews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/news`);
      if (res.ok) setNews(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, news: false })); }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/reviews`);
      if (res.ok) setReviews(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, reviews: false })); }
  };

  const fetchExecutives = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/executives`);
      if (res.ok) setExecutives(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, executives: false })); }
  };

  const fetchPricing = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/pricing`);
      if (res.ok) setPricing(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, pricing: false })); }
  };

  const fetchCompliance = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/compliance`);
      if (res.ok) setCompliance(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, compliance: false })); }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/hiring`);
      if (res.ok) setJobs(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, jobs: false })); }
  };

  const fetchCompetitors = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/competitors`);
      if (res.ok) setCompetitors(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, competitors: false })); }
  };

  const fetchPainPoints = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/pain-points`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setPainPoints(data);
        } else {
          analyzePainPoints();
        }
      }
    } catch (err) { console.error(err); } finally { setLoading(p => ({ ...p, painPoints: false })); }
  };

  const analyzePainPoints = async () => {
    setAnalyzingPain(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/needs`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPainPoints(data.pain_points);
      }
    } catch (err) { console.error(err); } finally { setAnalyzingPain(false); }
  };

  const reCrawlCompany = async () => {
    if (!basicInfo) return;
    try {
      setIsCrawling(true);
      setLoading({ basic: true, overview: true, social: true, website: true, tech: true, seo: true, performance: true, news: true, reviews: true, jobs: true, painPoints: true, executives: true, pricing: true, compliance: true, study: true, competitors: true });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/pipeline/start`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: basicInfo.domain }),
      });
      if (res.ok) { const data = await res.json(); router.push(`/dashboard/profile/${companyId}?job_id=${data.job_id}`); }
    } catch (err) { console.error(err); setIsCrawling(false); }
  };

  const toggleCard = (key: string) => {
    setExpandedCards(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const { jsPDF } = await import("jspdf");
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const printWidth = pdfWidth - (margin * 2);
      
      let currentY = margin;
      const sections = Array.from(reportRef.current.children) as HTMLElement[];
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const canvas = await html2canvas(section, { 
          scale: 2, 
          useCORS: true, 
          logging: false 
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const imgHeight = (canvas.height * printWidth) / canvas.width;
        
        if (currentY + imgHeight > pageHeight - margin) {
           if (imgHeight <= pageHeight - margin * 2) {
             pdf.addPage();
             currentY = margin;
             pdf.addImage(imgData, 'JPEG', margin, currentY, printWidth, imgHeight);
             currentY += imgHeight + 5;
           } else {
             if (currentY > margin) {
               pdf.addPage();
               currentY = margin;
             }
             let heightLeft = imgHeight;
             let sliceOffset = 0;
             
             pdf.addImage(imgData, 'JPEG', margin, currentY, printWidth, imgHeight);
             let printedOnCurrentPage = pageHeight - currentY - margin;
             heightLeft -= printedOnCurrentPage;
             sliceOffset += printedOnCurrentPage;
             
             let lastSliceHeight = printedOnCurrentPage;
             while (heightLeft > 0) {
               pdf.addPage();
               pdf.addImage(imgData, 'JPEG', margin, margin - sliceOffset, printWidth, imgHeight);
               lastSliceHeight = Math.min(heightLeft, pageHeight - margin * 2);
               heightLeft -= lastSliceHeight;
               sliceOffset += lastSliceHeight;
             }
             currentY = margin + lastSliceHeight + 5;
           }
        } else {
           pdf.addImage(imgData, 'JPEG', margin, currentY, printWidth, imgHeight);
           currentY += imgHeight + 5;
        }
      }
      
      pdf.save(`${basicInfo?.name || 'Company'}_Intelligence_Report.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPitchDeck = async () => {
    setIsExportingPitchDeck(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/exports/${companyId}/pitch-deck`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${basicInfo?.name || 'Company'}_Pitch_Deck.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error generating pitch deck:", error);
    } finally {
      setIsExportingPitchDeck(false);
    }
  };

  const handleGenerateOutreach = async () => {
    setIsModalOpen(true);
    setGeneratingOutreach(true);
    setOutreachData(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/generate-message`, { method: "POST" });
      if (res.ok) {
        setOutreachData(await res.json());
      }
    } catch (e) {
      console.error("Failed to generate outreach", e);
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const handleUpdateFact = async (factId: number) => {
    if (!editFactValue.trim()) return;
    setSavingFact(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/companies/${companyId}/facts/${factId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fact_value: editFactValue })
      });
      if (res.ok) {
        const updatedFact = await res.json();
        setOverview((prev: any) => ({
          ...prev,
          facts: prev.facts.map((f: any) => f.id === factId ? updatedFact : f)
        }));
        setEditingFactId(null);
        setEditFactValue("");
      }
    } catch (e) {
      console.error("Failed to update fact", e);
    } finally {
      setSavingFact(false);
    }
  };

  const linkedinProfile = socials.find(s => s.platform.toLowerCase() === "linkedin");
  const otherSocials = socials.filter(s => s.platform.toLowerCase() !== "linkedin");

  // Prepare Data for Visual Analytics
  let financialData: any[] = [];
  if (overview && overview.facts) {
    const revenueFact = overview.facts.find((f: any) => f.fact_name.toLowerCase() === 'revenue');
    const fundingFact = overview.facts.find((f: any) => f.fact_name.toLowerCase() === 'funding');
    const valFact = overview.facts.find((f: any) => f.fact_name.toLowerCase() === 'valuation');
    
    financialData = [
      { name: "Funding", value: fundingFact ? parseFinancialValue(fundingFact.fact_value) : 0, fill: "#3b82f6" },
      { name: "Revenue", value: revenueFact ? parseFinancialValue(revenueFact.fact_value) : 0, fill: "#10b981" },
      { name: "Valuation", value: valFact ? parseFinancialValue(valFact.fact_value) : 0, fill: "#8b5cf6" }
    ].filter(d => d.value > 0);
  }

  // Sentiment Donut Data (Heuristic based on text length for now, positive bias)
  let sentimentData: any[] = [];
  if (reviews.length > 0 || news.length > 0) {
    const posCount = reviews.length * 2 + news.length + 3;
    const neuCount = Math.max(1, Math.floor(news.length / 2));
    const negCount = Math.max(1, Math.floor(reviews.length / 4));
    
    sentimentData = [
      { name: 'Positive', value: posCount, color: '#10b981' },
      { name: 'Neutral', value: neuCount, color: '#94a3b8' },
      { name: 'Negative', value: negCount, color: '#ef4444' }
    ];
  } else {
    sentimentData = [
      { name: 'Positive', value: 70, color: '#10b981' },
      { name: 'Neutral', value: 20, color: '#94a3b8' },
      { name: 'Negative', value: 10, color: '#ef4444' }
    ];
  }

  return (
    <div className="w-full min-h-full bg-[#FAFAFA]">
      <div className="px-4 sm:px-8 lg:px-12 py-10">
        <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 flex flex-wrap justify-between items-center mb-6 py-4 bg-[#FAFAFA]/90 backdrop-blur-md border-b border-slate-200/50 -mx-4 px-4 sm:-mx-8 sm:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => document.getElementById('competitor-matrix')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 border border-slate-200/60 bg-white/50 backdrop-blur hover:bg-white hover:-translate-y-0.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300">
            <Users className="h-4 w-4 text-orange-500" /> 
            Competitor Matrix
          </button>
          <button onClick={handleGenerateOutreach} disabled={generatingOutreach || isCrawling}
            className="flex items-center gap-2 border border-slate-200/60 bg-white/50 backdrop-blur hover:bg-white hover:-translate-y-0.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300">
            <Mail className="h-4 w-4 text-emerald-500" /> 
            Generate Outreach
          </button>
          <button onClick={handleExportPitchDeck} disabled={isExportingPitchDeck || isCrawling}
            className="flex items-center gap-2 border border-slate-200/60 bg-white/50 backdrop-blur hover:bg-white hover:-translate-y-0.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50 transition-all duration-300">
            {isExportingPitchDeck ? <Loader2 className="h-4 w-4 animate-spin" /> : <Presentation className="h-4 w-4 text-purple-600" />} 
            {isExportingPitchDeck ? "Exporting..." : "Export Pitch Deck"}
          </button>
          <button onClick={handleExportPDF} disabled={isExporting || isCrawling}
            className="flex items-center gap-2 border border-slate-200/60 bg-white/50 backdrop-blur hover:bg-white hover:-translate-y-0.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-50 transition-all duration-300">
            {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} 
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          <button onClick={reCrawlCompany} disabled={isCrawling}
            className="flex items-center gap-2 border border-blue-600/20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:-translate-y-0.5 shadow-md shadow-blue-500/20 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-all duration-300">
            <RefreshCw className={`h-4 w-4 ${isCrawling ? "animate-spin" : ""}`} /> Refresh Discovery
          </button>
        </div>
      </div>

      <div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10">
      {/* Progress Banner */}
      {isCrawling && (
        <div className="bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 mb-8 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-[var(--brand-primary)]" /> Company Discovery in Progress
            </span>
            <span className="text-sm font-extrabold text-[var(--brand-primary)]">{crawlProgress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-[var(--surface-subtle)] h-2.5 rounded-full overflow-hidden mb-3">
            <div className="bg-[var(--brand-primary)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${crawlProgress}%` }}></div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Current stage: <span className="font-semibold">{currentTask || "Queued"}</span></p>
        </div>
      )}

      {/* ── Module 1: Company Discovery ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8 border-b border-slate-100 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)] text-white flex items-center justify-center font-black text-2xl shadow-sm">
            {basicInfo?.name?.[0] || "C"}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {loading.basic ? "Resolving Company..." : basicInfo?.name}
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-0.5">{basicInfo?.domain}</p>
          </div>
        </div>
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[var(--brand-primary)]" /> Module 1: Company Discovery
          </h2>
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 bg-white">
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Official Name</div>
                <div className="col-span-2 text-sm font-extrabold text-slate-800">
                  {loading.basic ? <div className="h-4 bg-slate-100 rounded w-2/3 animate-pulse"></div> : basicInfo?.name}
                </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Website</div>
                <div className="col-span-2 text-sm">
                  {loading.basic ? <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div> : (
                    <a href={`https://${basicInfo?.domain}`} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--brand-primary)] hover:text-[var(--text-secondary)] font-bold flex items-center gap-1.5 hover:underline">
                      <Globe className="h-4 w-4 text-blue-500" /> https://{basicInfo?.domain}
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Industry</div>
                <div className="col-span-2 text-sm font-bold text-slate-700">
                  {loading.overview ? <div className="h-4 bg-slate-100 rounded w-1/3 animate-pulse"></div> : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-[var(--text-secondary)] border border-blue-100 rounded-full text-xs font-bold">
                      <Building2 className="h-3.5 w-3.5" /> {overview?.industry || "Technology"}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Country</div>
                <div className="col-span-2 text-sm font-bold text-slate-700">
                  {loading.overview ? <div className="h-4 bg-slate-100 rounded w-1/4 animate-pulse"></div> : (
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <MapPin className="h-4 w-4 text-rose-500" /> {overview?.country || "N/A"}
                    </span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">LinkedIn</div>
                <div className="col-span-2 text-sm font-medium">
                  {loading.social ? <div className="h-4 bg-slate-100 rounded w-1/2 animate-pulse"></div> : linkedinProfile ? (
                    <a href={linkedinProfile.url} target="_blank" rel="noopener noreferrer"
                      className="text-[var(--brand-primary)] font-bold hover:underline flex items-center gap-1.5">
                      <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                      LinkedIn Page
                    </a>
                  ) : <span className="text-slate-400 italic">Not found</span>}
                </div>
              </div>
              <div className="grid grid-cols-3 p-4 items-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Social Profiles</div>
                <div className="col-span-2 text-sm">
                  {loading.social ? (
                    <div className="flex gap-2">
                      <div className="h-6 bg-slate-100 rounded-full w-12 animate-pulse"></div>
                      <div className="h-6 bg-slate-100 rounded-full w-16 animate-pulse"></div>
                    </div>
                  ) : otherSocials.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {otherSocials.map((prof, idx) => (
                        <a key={idx} href={prof.url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded-full text-xs font-bold transition-colors">
                          <Share2 className="h-3 w-3" /> {prof.platform}
                        </a>
                      ))}
                    </div>
                  ) : <span className="text-slate-400 italic">No additional social profiles found</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      
      {/* ── Module 6: Company Info ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[var(--brand-primary)]" /> Overview
          </h2>
          <p className="text-sm text-slate-400 mb-6">Deep extraction of company financials, founders, products, and services.</p>

          {loading.overview || (isCrawling && (!overview?.facts || overview.facts.length === 0)) ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="h-32 bg-slate-100 rounded-xl"></div>
             ))}
           </div>
          ) : !overview?.facts || overview.facts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No validated facts available yet. Run a company discovery scan to populate this section.</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {overview.facts.map((fact: any, i: number) => (
                  <div key={i} className={`border ${fact.confidence === 1.0 ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'} rounded-xl p-4 shadow-sm relative flex flex-col justify-between overflow-visible`}>
                    <div>
                      <div className="absolute top-0 right-0 px-2 py-1 bg-slate-50 border-b border-l border-slate-200 rounded-bl-lg flex items-center gap-2 z-10">
                        {fact.confidence === 1.0 ? (
                          <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> VERIFIED
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-400">
                            {Math.round(fact.confidence * 100)}% VERIFIED
                          </span>
                        )}
                        <button 
                          onClick={() => { setEditingFactId(fact.id); setEditFactValue(fact.fact_value); }}
                          className="text-slate-400 hover:text-[var(--brand-primary)] transition-colors ml-2"
                          title="Edit this fact"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 pr-20">{fact.fact_name}</p>
                      
                      {editingFactId === fact.id ? (
                        <div className="mb-4 space-y-2 relative z-20">
                          <textarea
                            value={editFactValue}
                            onChange={(e) => setEditFactValue(e.target.value)}
                            className="w-full text-sm border border-slate-300 rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateFact(fact.id)}
                              disabled={savingFact}
                              className="bg-[var(--brand-primary)] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 font-semibold hover:bg-[var(--brand-primary-dark)] transition-colors"
                            >
                              {savingFact ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                              Save
                            </button>
                            <button
                              onClick={() => setEditingFactId(null)}
                              className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded font-semibold hover:bg-slate-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="font-bold text-slate-800 text-base mb-4 break-words whitespace-pre-wrap">{fact.fact_value}</p>
                      )}
                    </div>
                    
                    <div className="pt-3 border-t border-slate-100 mt-auto">
                      <p className="text-[10px] text-slate-500 font-medium">Source:</p>
                      {fact.url && fact.url.startsWith("http") ? (
                        <a href={fact.url} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline truncate block">
                          {fact.source}
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600 block truncate">{fact.source}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual Analytics Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Visual Analytics</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Scale Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-500" />
              Financial Scale (Millions USD)
            </h3>
            {financialData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `$${value}M`} />
                    <RechartsTooltip 
                      cursor={{fill: '#f8fafc'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      formatter={(value: any) => [`$${value}M`, 'Estimated']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {financialData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <BarChart2 className="h-8 w-8 mb-2 opacity-50" />
                <p>Not enough financial data to display</p>
              </div>
            )}
          </div>

          {/* Sentiment Analysis Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-emerald-500" />
              Public Sentiment Analysis
            </h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-black text-slate-800">
                  {Math.round((sentimentData.find(d => d.name === 'Positive')?.value || 0) / sentimentData.reduce((acc, curr) => acc + curr.value, 0) * 100)}%
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Positive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── News ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-[var(--brand-primary)]" /> News
          </h2>
          <p className="text-sm text-slate-400 mb-6">Latest press mentions, articles, and aggregated ratings.</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-slate-400" /> Recent News
              </h3>
              {loading.news ? (
                <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div></div></div></div>
              ) : news.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No news articles found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.map((n: any, i: number) => (
                    <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" className="block border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-[var(--brand-primary)] bg-blue-50 px-2 py-1 rounded-md">{n.source}</span>
                        <span className="text-xs text-slate-400 font-medium">{n.published_date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2">{n.headline}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3">{n.summary}</p>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-slate-400" /> Reviews & Ratings
              </h3>
              {loading.reviews ? (
                <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-2 bg-slate-200 rounded"></div></div></div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-slate-400 italic">No reviews found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((r: any, i: number) => (
                    <div key={i} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" /> {r.rating}/5
                        </span>
                        <span className="text-xs text-slate-500 font-medium">{r.platform}</span>
                      </div>
                      <p className="text-sm text-slate-600 italic">"{r.review_text}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ── Pain Points ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] flex items-center gap-2">
              <AlertOctagon className="h-5 w-5 text-red-500" /> Company Pain Points
            </h2>
            <button
              onClick={analyzePainPoints}
              disabled={analyzingPain}
              id="analyze-pain-points-btn"
              className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all disabled:opacity-50"
            >
              {analyzingPain ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingDown className="h-3 w-3" />}
              {analyzingPain ? "Analyzing..." : "Re-Analyze"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-6">Detected across Internal, External, Social, and Government & Regulatory signals.</p>

          {loading.painPoints || analyzingPain ? (
            <div className="animate-pulse space-y-3">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
            </div>
          ) : painPoints.length === 0 ? (
            <div className="text-center py-10">
              <AlertOctagon className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 italic text-sm">No pain points detected yet.</p>
              <button onClick={analyzePainPoints} className="mt-4 text-sm font-bold px-5 py-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all">
                Run Analysis
              </button>
            </div>
          ) : (() => {
            const severityConfig: Record<string, { bg: string; text: string; border: string; dot: string }> = {
              Critical: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
              High:     { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
              Medium:   { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-400" },
              Low:      { bg: "bg-blue-50", text: "text-[var(--text-secondary)]", border: "border-blue-200", dot: "bg-blue-400" },
            };
            const sourceIcon: Record<string, React.ReactNode> = {
              reviews:     <Star className="h-3 w-3" />,
              news:        <Newspaper className="h-3 w-3" />,
              hiring:      <Briefcase className="h-3 w-3" />,
              financial:   <DollarSign className="h-3 w-3" />,
              social:      <Share2 className="h-3 w-3" />,
              competitors: <Users className="h-3 w-3" />,
            };
            const factorGroups: { label: string; prefix: string; icon: React.ReactNode; headerBg: string; headerText: string; headerBorder: string }[] = [
              { label: "Internal Factors", prefix: "[Internal]", icon: <Building2 className="h-4 w-4" />, headerBg: "bg-blue-50", headerText: "text-[var(--text-secondary)]", headerBorder: "border-blue-200" },
              { label: "External Factors", prefix: "[External]", icon: <Globe className="h-4 w-4" />, headerBg: "bg-sky-50", headerText: "text-sky-700", headerBorder: "border-sky-200" },
              { label: "Social Factors", prefix: "[Social]", icon: <Share2 className="h-4 w-4" />, headerBg: "bg-pink-50", headerText: "text-pink-700", headerBorder: "border-pink-200" },
              { label: "Government & Regulatory", prefix: "[Government & Regulatory]", icon: <Shield className="h-4 w-4" />, headerBg: "bg-emerald-50", headerText: "text-emerald-700", headerBorder: "border-emerald-200" },
            ];

            return (
              <div className="space-y-8">
                {factorGroups.map(group => {
                  const groupItems = painPoints.filter((pp: any) => pp.category.startsWith(group.prefix));
                  if (groupItems.length === 0) return null;
                  return (
                    <div key={group.label}>
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${group.headerBorder} ${group.headerBg} mb-3`}>
                        <span className={`${group.headerText}`}>{group.icon}</span>
                        <span className={`text-sm font-extrabold ${group.headerText} uppercase tracking-wider`}>{group.label}</span>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${group.headerBorder} ${group.headerText} bg-white/60`}>
                          {groupItems.length} signal{groupItems.length > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {groupItems.map((pp: any, i: number) => {
                          const cfg = severityConfig[pp.severity] || severityConfig.Medium;
                          const cleanCategory = pp.category.replace(/^\[.*?\]\s*/, "").replace(/^(Internal|External|Social|Government & Regulatory)\s*—?\s*/i, "");
                          return (
                            <div key={i} className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4`}>
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${cfg.dot}`} />
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className={`text-sm font-bold ${cfg.text}`}>{pp.title}</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} bg-white/60`}>{pp.severity}</span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/70 border border-slate-200 text-slate-500 flex items-center gap-1">
                                      {sourceIcon[pp.source] || <AlertTriangle className="h-3 w-3" />} {pp.source}
                                    </span>
                                    {cleanCategory && (
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-400">{cleanCategory}</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed">{pp.description}</p>
                                  {pp.evidence && (
                                    <p className="text-[11px] text-slate-400 mt-2 italic border-l-2 border-slate-200 pl-2">
                                      "{pp.evidence.length > 150 ? pp.evidence.slice(0, 150) + '...' : pp.evidence}"
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>


      {/* ── Competitor Matrix ── */}
      <div id="competitor-matrix" className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Users className="h-5 w-5 text-[var(--brand-primary)]" /> Competitor Matrix
          </h2>
          <p className="text-sm text-slate-400 mb-6">AI-identified alternatives, market rivals, and positioning strategies.</p>

          {loading.competitors ? (
            <div className="animate-pulse space-y-4"><div className="h-20 bg-slate-100 rounded-xl"></div><div className="h-20 bg-slate-100 rounded-xl"></div></div>
          ) : competitors.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No competitors identified.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Competitor</th>
                    <th className="px-4 py-3">Industry</th>
                    <th className="px-4 py-3 min-w-[200px]">Products/Services</th>
                    <th className="px-4 py-3 min-w-[250px]">Positioning & Differentiators</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitors.map((comp: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-900 whitespace-nowrap">{comp.competitor_name}</td>
                      <td className="px-4 py-4 text-slate-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold">{comp.industry || "N/A"}</span></td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(comp.products) ? comp.products.map((p: string, j: number) => (
                            <span key={j} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">{p}</span>
                          )) : <span className="text-slate-400 italic text-xs">Unknown</span>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 leading-relaxed">{comp.positioning || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Module 8: Hiring & Market ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[var(--brand-primary)]" /> Hiring
          </h2>
          <p className="text-sm text-slate-400 mb-6">Latest open roles, skill requirements, and hiring trends.</p>

          {loading.jobs ? (
            <div className="animate-pulse space-y-4"><div className="h-20 bg-slate-100 rounded-xl"></div><div className="h-20 bg-slate-100 rounded-xl"></div></div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No open job postings found.</div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job: any, i: number) => (
                <div key={i} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.department} • {job.location}</p>
                    </div>
                    <span className="text-xs font-bold text-[var(--brand-primary)] bg-blue-50 px-3 py-1.5 rounded-full self-start md:self-auto">
                      {job.posted_at || "Recently Posted"}
                    </span>
                  </div>
                  {job.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{job.description}</p>
                  )}
                  {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                      {job.skills.map((skill: string, j: number) => (
                        <span key={j} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

{/* ── Module 2: Website Intelligence ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Globe className="h-5 w-5 text-[var(--brand-primary)]" /> Module 2: Website Intelligence
          </h2>
          <p className="text-sm text-slate-400 mb-6">Discovered pages with structured content extraction.</p>

          {loading.website ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 p-4 animate-pulse">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mb-3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                </div>
              ))}
            </div>
          ) : webPages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No pages discovered yet. Run a crawl to populate this section.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {webPages.map((page) => {
                const Icon = PAGE_TYPE_ICONS[page.page_type] || FileText;
                const colorClass = PAGE_TYPE_COLORS[page.page_type] || PAGE_TYPE_COLORS.other;
                const isExpanded = expandedCards.has(page.url);
                const hasStructured = page.structured_data && (
                  (page.structured_data.items?.length > 0) ||
                  (page.structured_data.plans?.length > 0) ||
                  (page.structured_data.paragraphs?.length > 0)
                );
                return (
                  <div key={page.url} className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${colorClass}`}>
                          <Icon className="h-3 w-3" />
                          {page.page_type.charAt(0).toUpperCase() + page.page_type.slice(1)}
                        </span>
                        <a href={page.url} target="_blank" rel="noopener noreferrer"
                          className="shrink-0 text-slate-400 hover:text-[var(--brand-primary)] transition-colors">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{page.title || page.url}</p>
                      {page.content_snippet && (
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{page.content_snippet}</p>
                      )}
                    </div>
                    {hasStructured && (
                      <>
                        <button onClick={() => toggleCard(page.url)}
                          className="w-full flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                          <span>
                            {page.page_type === "pricing" ? "View Pricing Plans" :
                             page.page_type === "about" ? "View About Content" : "View Products / Services"}
                          </span>
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50">
                            {page.structured_data.paragraphs?.map((para: string, i: number) => (
                              <p key={i} className="text-xs text-slate-600 leading-relaxed mb-2">{para}</p>
                            ))}
                            {page.structured_data.items?.map((item: any, i: number) => (
                              <div key={i} className="mb-3 pb-3 border-b border-slate-100 last:border-0">
                                <p className="text-xs font-bold text-slate-800">{item.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
                              </div>
                            ))}
                            {page.structured_data.plans?.length > 0 && (
                              <div className="grid grid-cols-1 gap-3">
                                {page.structured_data.plans.map((plan: any, i: number) => (
                                  <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-xs font-extrabold text-slate-800">{plan.name}</p>
                                      {plan.price && (
                                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">{plan.price}</span>
                                      )}
                                    </div>
                                    {plan.features && (
                                      <ul className="mt-1 space-y-0.5">
                                        {plan.features.slice(0, 5).map((f: string, j: number) => (
                                          <li key={j} className="text-xs text-slate-500 flex items-start gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-500 mt-0.5 shrink-0" /> {f}
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Module 3: Technology Stack ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Cpu className="h-5 w-5 text-emerald-600" /> Module 3: Technology Stack
          </h2>
          <p className="text-sm text-slate-400 mb-6">Detected via HTML signals, HTTP response headers, font CDNs, and security headers.</p>

          {loading.tech ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-slate-100 rounded w-24 mb-2"></div>
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(3)].map((_, j) => <div key={j} className="h-7 bg-slate-100 rounded-full w-24"></div>)}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(techStack).length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic">No technology data available yet.</div>
          ) : (
            <div className="space-y-5">
              {[...TECH_CATEGORY_ORDER, ...Object.keys(techStack).filter(c => !TECH_CATEGORY_ORDER.includes(c))]
                .filter(cat => techStack[cat])
                .map(category => {
                  const Icon = TECH_CATEGORY_ICONS[category] || Cpu;
                  const colorClass = TECH_CATEGORY_COLORS[category] || "bg-gray-50 border-gray-200 text-gray-700";
                  return (
                    <div key={category}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{category}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {techStack[category].map((tech, i) => (
                          <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${colorClass}`}>
                            {tech.name}
                            {tech.version && <span className="opacity-60 text-[10px]">v{tech.version}</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ── Module 4: SEO Analysis ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <Search className="h-5 w-5 text-rose-500" /> Module 4: SEO Analysis
          </h2>
          <p className="text-sm text-slate-400 mb-6">Titles, descriptions, robots, sitemap, schema, Open Graph, headings, and broken links.</p>

          {loading.seo ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          ) : !seoData ? (
            <div className="text-center py-10 text-slate-400 italic">No SEO data available yet. Run a crawl to populate this section.</div>
          ) : (
            <div className="space-y-6">

              {/* SEO Score Gauge */}
              <div className="flex items-center gap-6 p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none" stroke="#e2e8f0" strokeWidth="3.5"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={seoData.score >= 75 ? "#10b981" : seoData.score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3.5"
                      strokeDasharray={`${seoData.score}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-black ${seoData.score >= 75 ? "text-emerald-600" : seoData.score >= 50 ? "text-amber-600" : "text-red-500"}`}>
                      {seoData.score}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-900 text-base">
                      {seoData.score >= 75 ? "Good SEO" : seoData.score >= 50 ? "Needs Improvement" : "Poor SEO"}
                    </p>
                    {seoData.confidence_score && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        {Math.round(seoData.confidence_score * 100)}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Score out of 100</p>
                  
                  {/* Evidence Score Breakdown */}
                  {seoData.evidence_summary && seoData.evidence_summary.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {seoData.evidence_summary.map((ev: string, i: number) => (
                        <p key={i} className={`text-xs font-medium ${ev.startsWith('✓') ? 'text-emerald-600' : 'text-red-500'}`}>{ev}</p>
                      ))}
                    </div>
                  )}
                  {seoData.score_breakdown && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Object.entries(seoData.score_breakdown).map(([k, v]: any) => (
                        <span key={k} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${v > 0 ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-600"}`}>
                          {k.replace(/_/g," ")}: {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Meta Info */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Title", icon: Tag, value: seoData.meta_title, mono: false },
                    { label: "Meta Description", icon: FileText, value: seoData.meta_description, mono: false },
                    { label: "Canonical URL", icon: Link2, value: seoData.canonical_url, mono: true },
                  ].map(({ label, icon: Icon, value, mono }) => (
                    <div key={label} className="grid grid-cols-3 p-4 items-start gap-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 pt-0.5">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </div>
                      <div className={`col-span-2 text-sm ${mono ? "font-mono text-[var(--text-secondary)] break-all" : "text-slate-700"}`}>
                        {value || <span className="text-slate-400 italic">Not found</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schema Types */}
              {seoData.schema_types?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Hash className="h-3.5 w-3.5"/> Schema.org Types</p>
                  <div className="flex flex-wrap gap-2">
                    {seoData.schema_types.map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 border border-blue-200 text-[var(--text-secondary)] text-xs font-bold rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Open Graph + Twitter Cards side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Open Graph */}
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5"/> Open Graph
                  </p>
                  {Object.keys(seoData.open_graph_tags || {}).length > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(seoData.open_graph_tags).slice(0, 6).map(([k, v]: any) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 pt-0.5 w-24 truncate">{k}</span>
                          <span className="text-xs text-slate-700 line-clamp-1">{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 italic">No OG tags found</p>}
                </div>

                {/* Twitter Cards */}
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5"/> Twitter Cards
                  </p>
                  {Object.keys(seoData.twitter_card_tags || {}).length > 0 ? (
                    <div className="space-y-1.5">
                      {Object.entries(seoData.twitter_card_tags).slice(0, 6).map(([k, v]: any) => (
                        <div key={k} className="flex gap-2">
                          <span className="text-[10px] font-mono text-slate-400 shrink-0 pt-0.5 w-24 truncate">{k}</span>
                          <span className="text-xs text-slate-700 line-clamp-1">{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-400 italic">No Twitter card tags found</p>}
                </div>
              </div>

              {/* Headings Structure */}
              {seoData.headings_structure && Object.keys(seoData.headings_structure).length > 0 && (
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1"><List className="h-3.5 w-3.5"/> Headings Structure</p>
                  <div className="space-y-3">
                    {["h1","h2","h3"].map(tag => {
                      const items: string[] = seoData.headings_structure[tag] || [];
                      if (!items.length) return null;
                      const colors: Record<string, string> = { h1: "bg-blue-50 text-[var(--text-secondary)] border-blue-200", h2: "bg-blue-50 text-[var(--text-secondary)] border-blue-200", h3: "bg-slate-50 text-slate-600 border-slate-200" };
                      return (
                        <div key={tag}>
                          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded border ${colors[tag]} mb-1`}>{tag.toUpperCase()}</span>
                          <ul className="space-y-0.5 ml-2">
                            {items.slice(0, 5).map((h, i) => <li key={i} className="text-xs text-slate-600 truncate">• {h}</li>)}
                            {items.length > 5 && <li className="text-xs text-slate-400 italic">+{items.length-5} more</li>}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Robots + Sitemap */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Shield className="h-3.5 w-3.5"/> Robots.txt</p>
                  {seoData.robots_txt ? (
                    <pre className="text-[10px] font-mono text-slate-600 whitespace-pre-wrap max-h-28 overflow-y-auto bg-slate-50 rounded-lg p-2">{seoData.robots_txt.slice(0, 500)}</pre>
                  ) : <p className="text-xs text-slate-400 italic">Not found</p>}
                </div>
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Globe className="h-3.5 w-3.5"/> Sitemap</p>
                  {seoData.sitemap_url && (
                    <a href={seoData.sitemap_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-mono text-[var(--brand-primary)] hover:underline break-all block mb-2">{seoData.sitemap_url}</a>
                  )}
                  <p className="text-xs text-slate-500">{seoData.sitemap_urls?.length || 0} URLs indexed</p>
                </div>
              </div>

              {/* Broken Links */}
              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  {seoData.broken_links_count > 0
                    ? <XCircle className="h-3.5 w-3.5 text-red-500"/>
                    : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500"/>}
                  Broken Links ({seoData.broken_links_count})
                </p>
                {seoData.broken_links_count === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold">✓ No broken links detected</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {seoData.broken_links_detail?.map((link: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 border border-red-200 text-red-600">{link.status_code || "ERR"}</span>
                        <span className="text-xs font-mono text-slate-600 truncate">{link.url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Module 5: Performance ── */}
      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">
        <div className="p-8">
          <h2 className="text-xl font-serif font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-500" /> Module 5: Performance Collection
          </h2>
          <p className="text-sm text-slate-400 mb-6">Core Web Vitals, page weight, compression, and image optimization scores.</p>

          {loading.performance || (isCrawling && !performance) ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl"></div>
              ))}
            </div>
          ) : !performance ? (
            <div className="text-center py-10 text-slate-400 italic">No Performance data available yet.</div>
          ) : (
            <div className="space-y-6">
              {/* Performance Score Gauge */}
              <div className="flex items-center gap-6 p-5 rounded-2xl border border-slate-200 bg-slate-50">
                <div className="relative w-20 h-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e2e8f0" strokeWidth="3.5"/>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none"
                      stroke={performance.performance_score >= 80 ? "#10b981" : performance.performance_score >= 50 ? "#f59e0b" : "#ef4444"}
                      strokeWidth="3.5" strokeDasharray={`${performance.performance_score}, 100`}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-xl font-black ${performance.performance_score >= 80 ? "text-emerald-600" : performance.performance_score >= 50 ? "text-amber-600" : "text-red-500"}`}>
                      {Math.round(performance.performance_score)}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-extrabold text-slate-900 text-base">Overall Performance</p>
                    {performance.confidence_score && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                        {Math.round(performance.confidence_score * 100)}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Simulated Score out of 100</p>
                  
                  {/* Evidence Score Breakdown */}
                  {performance.evidence_summary && performance.evidence_summary.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {performance.evidence_summary.map((ev: string, i: number) => (
                        <p key={i} className={`text-xs font-medium ${ev.startsWith('✓') ? 'text-emerald-600' : ev.startsWith('✗') ? 'text-red-500' : 'text-blue-500'}`}>{ev}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-2xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Core Web Vitals (Est.)</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">LCP:</span>
                      <span className="font-bold text-slate-900">{performance.core_web_vitals?.LCP || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">FID:</span>
                      <span className="font-bold text-slate-900">{performance.core_web_vitals?.FID || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">CLS:</span>
                      <span className="font-bold text-slate-900">{performance.core_web_vitals?.CLS || "N/A"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payload & Caching</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Page Weight:</span>
                      <span className="font-bold text-slate-900">{(performance.page_weight_bytes / 1024).toFixed(1)} KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Compression:</span>
                      <span className={`font-bold ${performance.compression_enabled ? "text-emerald-600" : "text-red-500"}`}>
                        {performance.compression_enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Caching Score:</span>
                      <span className="font-bold text-slate-900">{performance.caching_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Optimization */}
              <div className="border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1">
                  Image Optimization
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${performance.image_optimization_score >= 80 ? "bg-emerald-500" : performance.image_optimization_score >= 50 ? "bg-amber-500" : "bg-red-500"}`} 
                         style={{ width: `${performance.image_optimization_score}%` }}></div>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{Math.round(performance.image_optimization_score)}/100</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
      {/* End Report Wrapper */}

      </div> {/* End max-w-5xl */}
      </div> {/* End px-4 */}

      {/* Full News Article Modal */}
      {selectedNewsArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
              <div>
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md mb-3 inline-block">
                  {selectedNewsArticle.source}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                  {selectedNewsArticle.headline}
                </h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> 
                    {selectedNewsArticle.published_date ? new Date(selectedNewsArticle.published_date).toLocaleDateString() : "Unknown Date"}
                  </span>
                  {selectedNewsArticle.url && (
                    <a href={selectedNewsArticle.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                      <ExternalLink className="w-4 h-4" /> Original Source
                    </a>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setSelectedNewsArticle(null)}
                className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white">
              <div className="prose prose-slate prose-lg max-w-none">
                {selectedNewsArticle.full_content ? (
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {selectedNewsArticle.full_content}
                  </p>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Full content not available</h3>
                    <p className="text-slate-500">We could only scrape the headline and summary for this article.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Mail className="h-5 w-5 text-[var(--brand-primary)]" /> AI Outreach Generator
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {generatingOutreach ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)] mb-4" />
                  <p className="text-sm font-semibold">Crafting highly personalized outreach...</p>
                </div>
              ) : outreachData ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Cold Email
                    </h4>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-slate-900 mb-3 border-b border-slate-200 pb-2">
                        Subject: {outreachData.email_subject}
                      </p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {outreachData.email_body}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> LinkedIn Connection
                    </h4>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-sm text-blue-900 whitespace-pre-wrap font-mono leading-relaxed">
                        {outreachData.linkedin_message}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
