import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { meta, problems, clusters } from "@/lib/data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-body", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "ASIP Mentor guide - choose problems to mentor",
    template: "%s - ASIP Mentor guide",
  },
  description: `Browse ${problems.length} ASIP problem statements across ${clusters.length} clusters. Filter by cluster, source and domain, shortlist the ones you could mentor.`,
};

export const viewport: Viewport = {
  themeColor: "#f6f6f3",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${serif.variable}`}>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <footer className="no-print mt-24 border-t border-line">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-8 text-[0.8125rem] text-muted sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <p>ASIP Mentor guide. Local build, no tracking, no accounts.</p>
            <p>
              {meta.total} problems. Data generated <time dateTime={meta.generated}>{meta.generated}</time>.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
