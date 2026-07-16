import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Surge Startups | Intelligence Engine",
  description: "Elite AI-driven business analytics and lead generation for SMBs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black tracking-tighter text-sm">
                S
              </div>
              <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
                Surge Startups
              </Link>
            </div>
            
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link>
              <Link href="/services" className="hover:text-indigo-600 transition-colors">Services</Link>
              <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Platform</Link>
              <Link href="/history" className="hover:text-indigo-600 transition-colors">History</Link>
            </nav>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="hidden md:inline-flex h-9 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-700"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 opacity-80">
              <span className="font-bold tracking-tighter text-indigo-600">Surge Startups</span>
              <span className="text-slate-500 text-sm">© {new Date().getFullYear()} All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-500">
              <Link href="/about" className="hover:text-indigo-600 transition-colors">About</Link>
              <Link href="/services" className="hover:text-indigo-600 transition-colors">Services</Link>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">Twitter</a>
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
