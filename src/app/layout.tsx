import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SynapseLearn — AI-Powered Skill Exchange",
    template: "%s | SynapseLearn",
  },
  description: "Exchange skills, find mentors, and master new abilities through AI-powered peer learning. Cricket, coding, languages, and more.",
  keywords: ["skill exchange", "peer learning", "AI matching", "mentor", "learn", "teach", "SynapseLearn"],
  authors: [{ name: "SynapseLearn" }],
  openGraph: {
    title: "SynapseLearn — AI-Powered Skill Exchange",
    description: "Exchange skills, find mentors, and master new abilities through AI-powered peer learning.",
    type: "website",
    locale: "en_US",
    siteName: "SynapseLearn",
  },
  twitter: {
    card: "summary_large_image",
    title: "SynapseLearn — AI-Powered Skill Exchange",
    description: "Exchange skills, find mentors, and master new abilities through AI-powered peer learning.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ClientLayout>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ClientLayout>
      </body>
    </html>
  );
}
