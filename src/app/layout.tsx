import type { Metadata, Viewport } from "next"; //  Viewport added
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Script from "next/script";
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
  description:
    "Crafted with passion, delivered with love. Experience the ultimate midnight culinary journey.",
  applicationName: "Bites", //  added
  manifest: "/manifest.json", //   links the PWA manifest
  icons: {
    //  added
    icon: "/image/bites_app_logo.png",
    apple: "/image/bites_app_logo.png", // iOS "Add to Home Screen" icon
  },
  appleWebApp: {
    //   iOS install behaviour
    capable: true,
    title: "Bites",
    statusBarStyle: "black-translucent",
  },
};

//   controls browser/status bar colour on phones
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

// Top-level HTML shell
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${headingFont.variable} ${bodyFont.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&family=Plus+Jakarta+Sans:wght@500..800&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md antialiased selection:bg-primary-container selection:text-surface">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            theme="dark"
            richColors
            toastOptions={{
              classNames: {
                toast:
                  "font-body-md border rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm font-semibold",
                success:
                  "!bg-emerald-950/95 !text-emerald-200 !border-emerald-500/50 [&>svg]:!text-emerald-400 font-semibold shadow-emerald-950/40",
                error:
                  "!bg-red-950/95 !text-red-200 !border-red-500/50 [&>svg]:!text-red-400 font-semibold shadow-red-950/40",
                info: "!bg-surface-container-high/95 !text-on-surface !border-outline-variant/40 [&>svg]:!text-primary font-semibold",
                warning:
                  "!bg-amber-950/95 !text-amber-200 !border-amber-500/50 [&>svg]:!text-amber-400 font-semibold shadow-amber-950/40",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
