import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # Step 1: Wrap the modules in a grid container
    # The modules start after the Progress Banner
    prog_end = content.find('{/* ── Module 1: Company Discovery ── */}')
    
    # We need to wrap everything from Module 1 down to the end of the reportRef div.
    # The end of the reportRef div is just before `</div>` and then `</div>` and then `</div>` in the return statement.
    
    # Let's just find each module and add the col-span classes.
    # But wait, if they aren't in a grid container, col-span does nothing!
    # So we MUST add a grid container.
    
    parts = content.split('{/* ── Module 1: Company Discovery ── */}')
    if len(parts) == 2:
        top_half = parts[0]
        bottom_half = '{/* ── Module 1: Company Discovery ── */}' + parts[1]
        
        # We need to insert `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">` before Module 1.
        # And close it before the final `</div></div></div>`.
        
        # Let's see the end of the file
        bottom_lines = bottom_half.split('\n')
        # find the last 3 '</div>'
        # we will just insert `</div>` at the end of the grid.
        
        # Actually, let's just use string replacement for the module wrappers.
        
        # Grid container start
        top_half += '<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">\n'
        
        # Now for each module in bottom_half, we want to replace `mb-6` with `col-span-X`.
        # And remove `mb-12` from Visual Analytics.
        
        # Module 1: Company Discovery -> span 12
        bottom_half = bottom_half.replace(
            '{/* ── Module 1: Company Discovery ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 1: Company Discovery ── */}\n      <div className="lg:col-span-12 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # Module 6: Company Info -> span 8
        bottom_half = bottom_half.replace(
            '{/* ── Module 6: Company Info ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 6: Company Info ── */}\n      <div className="lg:col-span-8 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # Visual Analytics Section -> span 4 (convert to a single column inside)
        bottom_half = bottom_half.replace(
            '{/* Visual Analytics Section */}\n      <div className="mb-12">',
            '{/* Visual Analytics Section */}\n      <div className="lg:col-span-4 flex flex-col gap-6">'
        )
        # Fix the internal grid of Visual Analytics from grid-cols-2 to grid-cols-1
        bottom_half = bottom_half.replace(
            '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
            '<div className="grid grid-cols-1 gap-6">'
        )
        # Also upgrade the visual analytics cards to match the new bento style
        bottom_half = bottom_half.replace(
            '<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">',
            '<div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 p-6 hover:-translate-y-1 transition-all duration-300">'
        )
        
        # Module 8: Hiring -> span 6
        bottom_half = bottom_half.replace(
            '{/* ── Module 8: Hiring & Market ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 8: Hiring & Market ── */}\n      <div className="lg:col-span-6 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # Module 2: Website Intelligence -> span 6
        bottom_half = bottom_half.replace(
            '{/* ── Module 2: Website Intelligence ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 2: Website Intelligence ── */}\n      <div className="lg:col-span-6 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # Module 3: Technology Stack -> span 6
        bottom_half = bottom_half.replace(
            '{/* ── Module 3: Technology Stack ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 3: Technology Stack ── */}\n      <div className="lg:col-span-6 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # Module 4: SEO Analysis -> span 6
        bottom_half = bottom_half.replace(
            '{/* ── Module 4: SEO Analysis ── */}\n      <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8">',
            '{/* ── Module 4: SEO Analysis ── */}\n      <div className="lg:col-span-6 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300">'
        )
        
        # All other modules keep their standard flow but adapt to col-span-12
        bottom_half = bottom_half.replace(
            'className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden mb-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300 print:mb-8"',
            'className="lg:col-span-12 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300"'
        )
        
        # Decrease padding from p-8 to p-6 inside modules to make them denser
        bottom_half = bottom_half.replace('className="p-8"', 'className="p-6"')
        bottom_half = bottom_half.replace('className="p-8 ', 'className="p-6 ')
        
        # Close the grid div before the final closing tags
        # The file ends with:
        #       </div>
        #     </div>
        #   );
        # }
        bottom_half = bottom_half.replace(
            '      </div>\n    </div>\n  );\n}',
            '      </div>\n      </div>\n    </div>\n  );\n}'
        )

        content = top_half + bottom_half
        
        with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
            f.write(content)
        
        print("Bento grid refactor applied.")

refactor_bento()
