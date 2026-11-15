import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Geist, Geist_Mono, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import ChatPanel from "@/components/ChatPanel";
import StarField from "@/components/StarField";
import ThemeToggle from "@/components/ThemeToggle";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Only for the two Devanagari phrases on the home page (Agni Shant, Agni Rakshaks).
const deva = Noto_Sans_Devanagari({ variable: "--font-deva", subsets: ["devanagari"], weight: ["500", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { default: "Flame in Freefall · BrahmAstra Analytics", template: "%s · Flame in Freefall" },
  description:
    "AI-assisted dashboard that ranks and interprets NASA microgravity combustion experiments for crew-habitat fire safety.",
};

const NAV = [
  ["/guide", "Guide"],
  ["/dashboard", "Dashboard"],
  ["/compare", "Compare"],
  ["/gaps", "Evidence gaps"],
  ["/implications", "Implications"],
  ["/predict", "Predict"],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${deva.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("ffd.theme");var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <StarField />
        </Suspense>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              Flame in Freefall
            </Link>
            <nav className="nav" aria-label="Main">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="header-actions">
              <ThemeToggle />
              <ChatPanel />
            </div>
          </div>
        </header>
        <main id="main" className="container" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="container">
            Data: NASA Physical Sciences Informatics (PSI), CC0-1.0. AI-generated content is labelled.
            Built by BrahmAstra Analytics for NASA Space Apps Challenge 2026.
            <br />
            Team: Gowrika Mahesh, Utkarsh Sawant, Arun Kumar.
          </div>
        </footer>
      </body>
    </html>
  );
}
