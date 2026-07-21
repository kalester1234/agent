import re

def refactor_bento():
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'r') as f:
        content = f.read()

    # Find any `<div id="competitor-matrix" className="bg-white/70...`
    # and `<div className="bg-white/70...` that DOES NOT start with `md:col-span`
    
    # regex to find className="bg-white/70" and replace with className="md:col-span-12 bg-white/70"
    # Make sure we don't double add it.
    
    content = content.replace('className="bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300"',
                              'className="md:col-span-12 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 break-inside-avoid print:shadow-none print:border-slate-300"')
    
    with open('frontend/src/app/dashboard/profile/[id]/page.tsx', 'w') as f:
        f.write(content)

    print("Fixed missing col-spans.")

refactor_bento()
