"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { BlogPost } from "@/lib/blog";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Cursor } from "./Cursor";
import { ScrollProgress } from "./ScrollProgress";
import { Magnetic } from "./Magnetic";

export function BlogPostDetail({ post }: { post: BlogPost }) {
  const { metadata, content } = post;

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Cursor />
      <ScrollProgress />
      <Navigation />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-24 select-text">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Magnetic strength={0.2} dataCursor="hover">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono-display uppercase tracking-widest text-muted-foreground hover:text-lime transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Logbook
            </Link>
          </Magnetic>
        </motion.div>

        {/* Article Header */}
        <header className="space-y-4 pb-8 border-b border-hairline">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 py-0.5 font-mono-display text-[9px] uppercase tracking-wider text-lime"
              >
                <Tag className="h-2 w-2" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-[1.15] tracking-tight">
            {metadata.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2">
            <span className="flex items-center gap-1.5 font-mono-display">
              <Calendar className="h-3.5 w-3.5" />
              {metadata.date}
            </span>
            <span className="flex items-center gap-1.5 font-mono-display">
              <BookOpen className="h-3.5 w-3.5" />
              {metadata.readTime}
            </span>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-muted-foreground italic pt-2 leading-relaxed">
            "{metadata.description}"
          </p>
        </header>

        {/* Article Body */}
        <article className="mt-10 prose prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-p:text-base prose-p:leading-relaxed prose-p:text-muted-foreground/90 prose-p:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ul:my-4 prose-li:my-1.5 prose-li:text-muted-foreground/90 font-sans">
          <ReactMarkdown
            components={{
              // Custom code block renderer for clean, custom styling without heavy plugins
              code({ node, className, children, ...props }) {
                // Determine if code block is block or inline
                const isBlock = className && className.startsWith("language-");
                
                return isBlock ? (
                  <div className="relative my-6 overflow-hidden rounded-xl border border-hairline bg-surface-2/60">
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-hairline bg-surface px-4 py-2 text-[10px] font-mono-display text-muted-foreground uppercase tracking-wider">
                      <span>{className.replace("language-", "")}</span>
                      <span>Code</span>
                    </div>
                    {/* Code block */}
                    <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-lime leading-relaxed">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code
                    className="bg-surface-2 border border-hairline rounded px-1.5 py-0.5 text-xs font-mono text-lime"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              h2: ({ children }) => (
                <h2 className="font-display text-2xl font-bold text-foreground mt-10 mb-4 pb-2 border-b border-hairline">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="text-base leading-relaxed text-muted-foreground/90 my-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 my-4 space-y-1.5 text-muted-foreground/90">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  {children}
                </li>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-lime hover:underline hover:text-lime/90 font-medium transition-colors"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-lime/60 bg-surface/30 px-5 py-4 my-6 rounded-r-xl italic text-muted-foreground leading-relaxed">
                  {children}
                </blockquote>
              )
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
