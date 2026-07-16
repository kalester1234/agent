"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, Loader2, Database, Download } from "lucide-react";

interface SavedReport {
  id: number;
  company_name: string;
  company_domain: string;
  created_at: string;
  status: string;
}

export default function HistoryPage() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/reports");
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewReport = async (id: number) => {
    try {
      setSelectedReportId(id);
      setLoadingDetails(true);
      const res = await fetch(`http://localhost:8000/api/v1/reports/${id}`);
      if (!res.ok) throw new Error("Failed to fetch report details");
      const data = await res.json();
      setReportDetails(data);
    } catch (err: any) {
      console.error(err);
      alert("Could not load report details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownloadPdf = async () => {
    const element = contentRef.current;
    if (!element) return;
    
    // Temporarily adjust styling for perfect PDF generation
    const originalClasses = element.className;
    element.className = "bg-white p-10 text-black font-sans";
    
    try {
      const { toPng } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');
      
      const dataUrl = await toPng(element, { quality: 0.98, pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${reportDetails?.company_name || 'intelligence_report'}.pdf`);
    } catch (err) {
      console.error("PDF Generation failed:", err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      // Restore original UI classes
      element.className = originalClasses;
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-slate-50 min-h-screen py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-6xl w-full">
        
        <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report History</h1>
            <p className="text-slate-600">Access and download all your previously generated intelligence reports.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 border border-red-100">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: List of Reports */}
          <div className="md:col-span-1 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            {loading ? (
              <div className="flex justify-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
                <p className="text-slate-500 mb-4">No reports found.</p>
                <Link href="/dashboard" className="text-indigo-600 font-medium hover:underline">
                  Generate a new report
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {reports.map((report) => (
                    <button
                      key={report.id}
                      onClick={() => viewReport(report.id)}
                      className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                        selectedReportId === report.id ? "bg-indigo-50 border-l-4 border-indigo-600" : "border-l-4 border-transparent"
                      }`}
                    >
                      <h3 className="font-bold text-slate-900 line-clamp-1">{report.company_name || report.company_domain}</h3>
                      <p className="text-xs text-slate-500 mt-1">{report.company_domain}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Report Details Viewer */}
          <div className="md:col-span-2 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            {!selectedReportId ? (
              <div className="bg-white/50 border border-slate-200 border-dashed rounded-2xl h-[400px] flex items-center justify-center text-slate-400">
                Select a report from the list to view its contents.
              </div>
            ) : loadingDetails ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
              </div>
            ) : reportDetails ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{reportDetails.company_name}</h2>
                    <p className="text-slate-500 mt-1">{reportDetails.company_domain}</p>
                  </div>
                  <button 
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>

                {/* Printable Container */}
                <div 
                  id="historical-report-container" 
                  ref={contentRef} 
                  className="bg-white rounded-2xl p-2 print:shadow-none print:border-none print:p-0 print:text-black space-y-6"
                >
                  {reportDetails.report && reportDetails.report.company ? (
                    <div className="border border-slate-200/85 rounded-2xl overflow-hidden shadow-sm">
                      <div className="divide-y divide-slate-100 bg-white">
                        
                        {/* Official Name */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Official Name</div>
                          <div className="col-span-2 text-sm font-extrabold text-slate-800">
                            {reportDetails.report.company.official_name}
                          </div>
                        </div>

                        {/* Website */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Website</div>
                          <div className="col-span-2 text-sm">
                            <a
                              href={`https://${reportDetails.report.company.official_domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
                            >
                              https://{reportDetails.report.company.official_domain}
                            </a>
                          </div>
                        </div>

                        {/* Industry */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Industry</div>
                          <div className="col-span-2 text-xs font-bold">
                            <span className="inline-flex px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full">
                              {reportDetails.report.company.industry || "Technology"}
                            </span>
                          </div>
                        </div>

                        {/* Country */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Country</div>
                          <div className="col-span-2 text-sm font-bold text-slate-700">
                            {reportDetails.report.company.headquarters || "N/A"}
                          </div>
                        </div>

                        {/* LinkedIn */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">LinkedIn</div>
                          <div className="col-span-2 text-sm font-medium text-slate-750">
                            {reportDetails.report.social?.profiles?.find((p: any) => p.platform.toLowerCase() === "linkedin") ? (
                              <a
                                href={reportDetails.report.social.profiles.find((p: any) => p.platform.toLowerCase() === "linkedin").url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-650 font-bold hover:underline"
                              >
                                LinkedIn Page
                              </a>
                            ) : (
                              <span className="text-slate-400 italic">Not found</span>
                            )}
                          </div>
                        </div>

                        {/* Other Social Profiles */}
                        <div className="grid grid-cols-3 p-4 items-center">
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Profiles</div>
                          <div className="col-span-2 text-sm">
                            {reportDetails.report.social?.profiles?.filter((p: any) => p.platform.toLowerCase() !== "linkedin").length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {reportDetails.report.social.profiles
                                  .filter((p: any) => p.platform.toLowerCase() !== "linkedin")
                                  .map((prof: any, pIdx: number) => (
                                    <a
                                      key={pIdx}
                                      href={prof.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex px-2 py-0.5 bg-slate-105 border border-slate-200 text-slate-700 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors"
                                    >
                                      {prof.platform}
                                    </a>
                                  ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No additional social profiles found</span>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-50 text-amber-800 rounded-lg border border-amber-200">
                      Discovery results could not be parsed.
                    </div>
                  )}
                </div>

              </div>
            ) : null}
          </div>

        </div>
      </div>
    </div>
  );
}
