import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # Sticky Header
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

    # Extract Module 1
    mod1_start = content.find('{/* ── Module 1: Company Discovery ── */}')
    mod2_start = content.find('{/* ── Module 2: Website Intelligence ── */}')
    if mod1_start != -1 and mod2_start != -1:
        mod1_content = content[mod1_start:mod2_start]
        # Remove it safely
        content = content.replace(mod1_content, '')
        # Insert it before Module 6
        content = content.replace('{/* ── Module 6: Company Info ── */}', mod1_content + '{/* ── Module 6: Company Info ── */}')

    # Add Grid to reportRef container
    content = content.replace(
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10">',
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">'
    )

    # Progress Banner
    content = content.replace(
        '<div className="bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 mb-8 shadow-sm">',
        '<div className="md:col-span-12 bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 shadow-sm">'
    )

    old_card_class = 'className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-6 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8"'
    
    def add_col_span(module_marker, col_span):
        nonlocal content
        target = module_marker + '\n      <div ' + old_card_class + '>'
        replacement = module_marker + '\n      <div className="md:col-span-' + str(col_span) + ' bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        content = content.replace(target, replacement)

    add_col_span('{/* ── Module 1: Company Discovery ── */}', 12)
    add_col_span('{/* ── Module 6: Company Info ── */}', 8)
    add_col_span('{/* ── Module 2: Website Intelligence ── */}', 6)
    add_col_span('{/* ── Module 3: Technology Stack ── */}', 6)
    add_col_span('{/* ── Module 4: SEO Analysis ── */}', 12)
    add_col_span('{/* ── Module 5: Performance ── */}', 6)
    add_col_span('{/* ── Module 8: Hiring & Market ── */}', 6)

    # Any remaining modules fall back to span 12
    content = content.replace(old_card_class, 'className="md:col-span-12 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300"')

    # Visual Analytics -> 4 Cols
    content = content.replace(
        '{/* Visual Analytics Section */}\n      <div className="mb-12">',
        '{/* Visual Analytics Section */}\n      <div className="md:col-span-4 flex flex-col gap-6">'
    )
    # Fix internal visual analytics grid
    content = content.replace(
        '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
        '<div className="grid grid-cols-1 gap-6">'
    )
    # Upgrade its cards
    content = content.replace(
        '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">',
        '<div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 hover:-translate-y-1 transition-all duration-300">'
    )

    # Increase data density
    content = content.replace('className="p-8"', 'className="p-6"')
    content = content.replace('className="p-8 ', 'className="p-6 ')

    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
        f.write(content)
    
    print("Bento applied successfully.")

refactor_bento()
