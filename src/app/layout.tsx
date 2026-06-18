import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Space_Grotesk, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-display",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "KM Nutankumar — AI Engineer & Systems Builder",
  description:
    "Portfolio of KM Nutankumar — AI Engineer building production RAG pipelines, autonomous agents, and cross-platform AI products. Based in Bangalore, India.",
  keywords: [
    "KM Nutankumar",
    "AI Engineer",
    "RAG",
    "LangChain",
    "LLaMA",
    "Mistral",
    "Portfolio",
    "Machine Learning",
    "Bangalore",
  ],
  authors: [{ name: "KM Nutankumar" }],
  openGraph: {
    title: "KM Nutankumar — AI Engineer & Systems Builder",
    description:
      "Production RAG pipelines, autonomous agents, and cross-platform AI products. Bangalore, India.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KM Nutankumar — AI Engineer & Systems Builder",
    description:
      "Production RAG pipelines, autonomous agents, and cross-platform AI products.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
