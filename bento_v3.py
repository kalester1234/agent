import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # Extract Module 1
    mod1_start = content.find('{/* ── Module 1: Company Discovery ── */}')
    mod2_start = content.find('{/* ── Module 2: Website Intelligence ── */}')
    if mod1_start != -1 and mod2_start != -1:
        mod1_content = content[mod1_start:mod2_start]
        # Remove it safely
        content = content.replace(mod1_content, '')
        # Insert it before Module 6
        content = content.replace('{/* ── Module 6: Company Info ── */}', mod1_content + '\n      {/* ── Module 6: Company Info ── */}')

    # Add Grid to reportRef container
    content = content.replace(
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10">',
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6">'
    )

    # Progress Banner
    content = content.replace(
        '<div className="bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 mb-8 shadow-sm">',
        '<div className="md:col-span-12 bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 shadow-sm">'
    )

    old_card_class = 'className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-6 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8"'
    new_card_base = 'className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300"'
    
    # 12 Cols
    content = content.replace('{/* ── Module 1: Company Discovery ── */}\n      <div ' + old_card_class + '>', '{/* ── Module 1: Company Discovery ── */}\n      <div className="md:col-span-12" ' + new_card_base.replace('className="', '>\n        <div className="') + '</div>')
    # wait, this is getting complicated because of nested divs if I do that.
    # Actually, why not just change the class directly.
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
