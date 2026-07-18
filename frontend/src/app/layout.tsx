import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SurgeStartups | Intelligence Engine",
  description: "Next-Gen Enterprise Search and Opportunity Radar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col selection:bg-blue-100 selection:text-blue-900">
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
