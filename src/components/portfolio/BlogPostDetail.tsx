"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import type { ReactNode } from "react";
import type { BlogPostMetadata } from "@/lib/blog";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Cursor } from "./Cursor";
import { ScrollProgress } from "./ScrollProgress";
import { Magnetic } from "./Magnetic";

/**
 * Interactive shell around a post. The body arrives as `children` already
 * rendered on the server (see BlogMarkdown), so only the metadata crosses into
 * the client bundle.
 */
export function BlogPostDetail({
  metadata,
  children,
}: {
  metadata: BlogPostMetadata;
  children: ReactNode;
}) {
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
        <article className="mt-10 max-w-none font-sans">
          {children}
        </article>
      </main>

      <Footer />
    </div>
  );
}
