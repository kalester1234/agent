import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # 1. Add Grid to reportRef container
    content = content.replace(
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10">',
        '<div ref={reportRef} className="bg-[#FAFAFA] -mx-4 px-4 sm:-mx-8 sm:px-8 pb-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">'
    )

    # 2. Progress Banner
    content = content.replace(
        '<div className="bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 mb-8 shadow-sm">',
        '<div className="md:col-span-12 bg-[#F5F8FF] border border-[var(--brand-primary-light)] rounded-2xl p-6 shadow-sm">'
    )

    old_card_class = 'className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8"'
    # Wait, the current page.tsx was restored to commit `18caeec`.
    # Let me double check what the card class is in `18caeec`.
    # In `18caeec`, I ran `refactor.py`, which changed the card class to:
    # 'bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8'
    
    # Let's just use regex to find the module start and add md:col-span to the direct following div.
    def add_col_span(module_marker, col_span):
        nonlocal content
        # Find the module marker
        idx = content.find(module_marker)
        if idx != -1:
            # Find the next `<div className="` after the marker
            div_idx = content.find('<div className="', idx)
            if div_idx != -1:
                # Insert `md:col-span-X ` right after `className="`
                insert_idx = div_idx + len('<div className="')
                content = content[:insert_idx] + f'md:col-span-{col_span} ' + content[insert_idx:]

    add_col_span('{/* ── Module 1: Company Discovery ── */}', 12)
    add_col_span('{/* ── Module 6: Company Info ── */}', 8)
    add_col_span('{/* ── Module 2: Website Intelligence ── */}', 6)
    add_col_span('{/* ── Module 3: Technology Stack ── */}', 6)
    add_col_span('{/* ── Module 4: SEO Analysis ── */}', 12)
    add_col_span('{/* ── Module 5: Performance ── */}', 6)
    add_col_span('{/* ── Module 8: Hiring & Market ── */}', 6)

    # 3. Visual Analytics -> 4 Cols
    # Visual Analytics doesn't have the same module marker format.
    idx = content.find('{/* Visual Analytics Section */}')
    if idx != -1:
        div_idx = content.find('<div className="', idx)
        if div_idx != -1:
            insert_idx = div_idx + len('<div className="')
            # It currently has `className="mb-12"`
            # We want to change it to `className="md:col-span-4 flex flex-col gap-6"`
            # Let's just replace the whole tag
            old_tag = content[div_idx:content.find('>', div_idx)+1]
            content = content[:div_idx] + '<div className="md:col-span-4 flex flex-col gap-6">' + content[div_idx + len(old_tag):]

    # Fix internal visual analytics grid
    content = content.replace(
        '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
        '<div className="grid grid-cols-1 gap-6">'
    )

    # Note: we don't need to change `p-8` to `p-6` again if we don't want to, but let's do it for density.
    content = content.replace('className="p-8"', 'className="p-6"')
    content = content.replace('className="p-8 ', 'className="p-6 ')
    
    # We also need to remove `mb-6` and `mb-12` and `print:mb-8` from the modules because the gap is handled by the grid!
    content = content.replace(' mb-6 ', ' ')
    content = content.replace(' mb-12 ', ' ')
    content = content.replace(' print:mb-8', '')

    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
        f.write(content)
    
    print("Bento applied cleanly.")

refactor_bento()
