import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import "./globals.css";
import "@/styles/aura-theme.css";
import { LanguageProvider } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI Readiness Assessment | Build Your AI Champion Guide",
  description: "Discover how to lead AI transformation in your department. Free 5-minute assessment for business leaders. Get your personalized AI implementation roadmap.",
  keywords: "AI readiness, artificial intelligence, business transformation, leadership, AI implementation, digital transformation",
  authors: [{ name: "AI Champion Guide" }],
  creator: "AI Champion Guide",
  publisher: "AI Champion Guide",
  metadataBase: new URL("https://ai-readiness-quiz.vercel.app"),
  openGraph: {
    title: "AI Readiness Assessment | Build Your AI Champion Guide",
    description: "Discover how to lead AI transformation in your department. Free 5-minute assessment for business leaders.",
    type: "website",
    locale: "en_US",
    alternateLocale: "pt_BR",
    siteName: "AI Champion Guide",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Readiness Assessment | Build Your AI Champion Guide",
    description: "Discover how to lead AI transformation in your department. Free 5-minute assessment for business leaders.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  themeColor: "#EC4E22",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
