import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # 1. Add grid to the reportRef container
    content = content.replace(
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10">',
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6">'
    )

    # 2. Progress Banner -> span 12
    content = content.replace(
        '<div className="bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 mb-8 shadow-sm">',
        '<div className="md:col-span-12 bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 shadow-sm">'
    )

    # 3. All standard modules (Modules 1, 2, 3, 4, 6, 8) 
    # Change their base class to remove mb-6 and add bento styles
    # We will temporarily change ALL of them to col-span-12, then refine them.
    old_card_class = 'className="bg-white rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8"'
    # Wait, the current page.tsx was restored! So it has the original class:
    old_card_class = 'bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden mb-6 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8'
    
    # We replace it with a placeholder that we will inject column spans into
    new_card_base = 'bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300'
    
    # Module 1 -> 12 cols
    content = content.replace(
        '{/* ── Module 1: Company Discovery ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 1: Company Discovery ── */}\n      <div className="md:col-span-12 ' + new_card_base + '">\n'
    )
    # Module 6 -> 8 cols
    content = content.replace(
        '{/* ── Module 6: Company Info ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 6: Company Info ── */}\n      <div className="md:col-span-8 ' + new_card_base + '">\n'
    )
    # Module 2 -> 6 cols
    content = content.replace(
        '{/* ── Module 2: Website Intelligence ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 2: Website Intelligence ── */}\n      <div className="md:col-span-6 ' + new_card_base + '">\n'
    )
    # Module 3 -> 6 cols
    content = content.replace(
        '{/* ── Module 3: Technology Stack ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 3: Technology Stack ── */}\n      <div className="md:col-span-6 ' + new_card_base + '">\n'
    )
    # Module 4 -> 12 cols
    content = content.replace(
        '{/* ── Module 4: SEO Analysis ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 4: SEO Analysis ── */}\n      <div className="md:col-span-12 ' + new_card_base + '">\n'
    )
    # Module 5 -> 6 cols
    content = content.replace(
        '{/* ── Module 5: Performance ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 5: Performance ── */}\n      <div className="md:col-span-6 ' + new_card_base + '">\n'
    )
    # Module 8 -> 6 cols
    content = content.replace(
        '{/* ── Module 8: Hiring & Market ── */}\n      <div className="' + old_card_class + '">',
        '{/* ── Module 8: Hiring & Market ── */}\n      <div className="md:col-span-6 ' + new_card_base + '">\n'
    )

    # Any remaining (like Module 9 if exists) to 12 cols
    content = content.replace(
        old_card_class,
        'md:col-span-12 ' + new_card_base
    )

    # 4. Visual Analytics Section -> 4 cols
    content = content.replace(
        '{/* Visual Analytics Section */}\n      <div className="mb-12">',
        '{/* Visual Analytics Section */}\n      <div className="md:col-span-4 flex flex-col gap-6">'
    )
    # Fix internal grid
    content = content.replace(
        '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
        '<div className="grid grid-cols-1 gap-6">'
    )
    # Card aesthetic upgrade
    content = content.replace(
        '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">',
        '<div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 hover:-translate-y-1 transition-all duration-300">'
    )
    
    # 5. Move Module 1 back to the top (Before Module 6)
    # We must extract Module 1 and put it above Module 6.
    mod1_start = content.find('{/* ── Module 1: Company Discovery ── */}')
    mod2_start = content.find('{/* ── Module 2: Website Intelligence ── */}')
    if mod1_start != -1 and mod2_start != -1:
        mod1_content = content[mod1_start:mod2_start]
        content = content[:mod1_start] + content[mod2_start:]
        mod6_start = content.find('{/* ── Module 6: Company Info ── */}')
        content = content[:mod6_start] + mod1_content + content[mod6_start:]

    # Reduce padding for denser data
    content = content.replace('p-8', 'p-6')
    
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
        f.write(content)
        
    print("Bento logic applied successfully without structural breaks.")

refactor_bento()
