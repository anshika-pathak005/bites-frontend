import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Work_Sans } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query/query-provider";
import "./globals.css";

// Headline font, exposed as a CSS variable for use across the app
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["400", "500", "600", "700", "800"],
});

// Body font, exposed as a CSS variable for use across the app
const bodyFont = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

// Default page metadata (title/description) for every route
export const metadata: Metadata = {
  title: "Bites | We Serve The Taste You Love",
  description: "Order fresh, farm-to-table dishes from Bites.",
};

// Top-level HTML shell shared by every route — sets fonts and wraps everything in the query provider + toaster.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${headingFont.variable} ${bodyFont.variable}`}>
      <body>
        <QueryProvider>
          {children}
          <Toaster position="top-center" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
