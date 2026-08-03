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
    <div className="relative flex min-h-screen flex-col bg-base-100">
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
              className="btn btn-ghost btn-sm gap-2 font-mono-display text-xs uppercase tracking-widest"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Logbook
            </Link>
          </Magnetic>
        </motion.div>

        {/* Article Header */}
        <header className="space-y-4 border-b border-base-300 pb-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <span
                key={tag}
                className="badge badge-primary badge-soft badge-sm gap-1 font-mono-display text-[9px] uppercase tracking-wider"
              >
                <Tag className="h-2 w-2" />
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl md:text-5xl">
            {metadata.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 pt-2 text-xs text-base-content/60">
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
          <p className="pt-2 text-base italic leading-relaxed text-base-content/70 sm:text-lg">
            &ldquo;{metadata.description}&rdquo;
          </p>
        </header>

        {/* Article Body */}
        {/* Element renderers below do the styling; the typography plugin is
            not installed, so no `prose` classes are used here. */}
        <article className="mt-10 max-w-none font-sans">
          <ReactMarkdown
            components={{
              // Custom code block renderer for clean, custom styling without heavy plugins
              code({ node, className, children, ...props }) {
                // Determine if code block is block or inline
                const isBlock = className && className.startsWith("language-");
                
                return isBlock ? (
                  <div className="my-6 overflow-hidden rounded-box border border-base-300 bg-base-200/60">
                    {/* Header bar */}
                    <div className="flex items-center justify-between border-b border-base-300 bg-base-300/50 px-4 py-2 font-mono-display text-[10px] uppercase tracking-wider text-base-content/60">
                      <span>{className.replace("language-", "")}</span>
                      <span>Code</span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-base-content sm:text-sm">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                ) : (
                  <code
                    className="rounded-field border border-base-300 bg-base-200 px-1.5 py-0.5 font-mono text-xs text-primary"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              h2: ({ children }) => (
                <h2 className="mb-4 mt-10 border-b border-base-300 pb-2 font-display text-2xl font-bold">
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p className="my-4 text-base leading-relaxed text-base-content/80">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="my-4 list-disc space-y-1.5 pl-6 text-base-content/80">
                  {children}
                </ul>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="link link-primary font-medium"
                >
                  {children}
                </a>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 rounded-r-box border-l-4 border-primary/60 bg-base-200/40 px-5 py-4 italic leading-relaxed text-base-content/70">
                  {children}
                </blockquote>
              ),
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
