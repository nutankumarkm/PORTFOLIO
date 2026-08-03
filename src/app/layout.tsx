import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/portfolio/ThemeProvider";

/* The whole type system hangs off these three variables — globals.css maps
   them to `font-display`, the body font, and `.font-mono-display`, so swapping
   a typeface means changing it here and nowhere else. All three are variable
   fonts, so every weight the components ask for is covered without listing
   them. */

const interTight = Inter_Tight({
  variable: "--font-display",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono-display",
  subsets: ["latin"],
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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash: apply the stored daisyUI theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${interTight.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
