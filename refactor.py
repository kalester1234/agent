import re

with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
    content = f.read()

# 1. Extract Module 1
mod1_start = content.find('{/* ── Module 1: Company Discovery ── */}')
mod2_start = content.find('{/* ── Module 2: Website Intelligence ── */}')
if mod1_start != -1 and mod2_start != -1:
    mod1_content = content[mod1_start:mod2_start]
    # Remove mod1_content from original
    content = content[:mod1_start] + content[mod2_start:]
    
    # Insert mod1_content before Module 6
    mod6_start = content.find('{/* ── Module 6: Company Info ── */}')
    content = content[:mod6_start] + mod1_content + "\n      " + content[mod6_start:]

# 2. Make Header Sticky and prettier
header_pattern = r'\{\/\* Header \*\/\}.*?<div className="flex justify-between items-center mb-6">.*?<div className="flex items-center gap-3">.*?Refresh Discovery\n          </button>\n        </div>\n      </div>'
new_header = """{/* Header */}
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
      </div>"""
content = re.sub(header_pattern, new_header, content, flags=re.DOTALL)

# 3. Upgrade Card Aesthetics
old_card_class = 'bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-6 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8'
new_card_class = 'bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8'
content = content.replace(old_card_class, new_card_class)

# Write back
with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
    f.write(content)

print("Refactor complete.")
