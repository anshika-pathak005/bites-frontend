import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { QueryProvider } from "@/lib/query/query-provider";
import "./globals.css";

// Premium, elegant headline font
const headingFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["500", "600", "700", "800"],
});

// Clean, professional, high-legibility body font
const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
});

// Default page metadata
export const metadata: Metadata = {
  title: "Bites | Midnight Culinary Experience",
  description: "Crafted with passion, delivered with love. Experience the ultimate midnight culinary journey.",
};

// Top-level HTML shell
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${headingFont.variable} ${bodyFont.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Plus+Jakarta+Sans:wght@500..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-surface">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: "#1c1b1b",
                border: "1px solid rgba(80, 69, 56, 0.6)",
                color: "#e5e2e1",
                borderRadius: "1rem",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0 12px 35px rgba(0, 0, 0, 0.85)",
              },
              className: "font-body-md",
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
