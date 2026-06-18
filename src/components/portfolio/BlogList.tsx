"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Tag } from "lucide-react";
import type { BlogPostMetadata } from "@/lib/blog";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { Cursor } from "./Cursor";
import { ScrollProgress } from "./ScrollProgress";
import { Magnetic } from "./Magnetic";
import { SectionHeading } from "./SectionHeading";

export function BlogList({ posts }: { posts: BlogPostMetadata[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  // Filter posts by selected tag
  const filteredPosts = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <Cursor />
      <ScrollProgress />
      <Navigation />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-32 pb-24">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Magnetic strength={0.2} dataCursor="hover">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono-display uppercase tracking-widest text-muted-foreground hover:text-lime transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Magnetic>
        </motion.div>

        {/* Section Heading */}
        <SectionHeading
          index="07"
          eyebrow="Technical"
          title="Logbook"
          accent="lime"
        />

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed"
        >
          In-depth technical write-ups, engineering notes, and logbook entries detailing RAG pipelines, distributed algorithms, and model fine-tuning.
        </motion.p>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-2 pb-6 border-b border-hairline"
          >
            <button
              onClick={() => setSelectedTag(null)}
              className={`rounded-full px-4 py-1.5 font-mono-display text-[10px] uppercase tracking-widest border transition-all duration-300 ${
                selectedTag === null
                  ? "bg-lime border-lime text-background font-bold"
                  : "border-hairline bg-surface hover:border-lime/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`rounded-full px-4 py-1.5 font-mono-display text-[10px] uppercase tracking-widest border transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-lime border-lime text-background font-bold"
                    : "border-hairline bg-surface hover:border-lime/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </motion.div>
        )}

        {/* Blog Listing Grid */}
        <div className="mt-12 space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group relative block rounded-2xl border border-hairline bg-surface-2/40 hover:bg-surface-2/70 p-6 sm:p-8 hover:border-border transition-colors overflow-hidden"
                >
                  {/* Subtle hover accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-lime scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center" />

                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Meta info row */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5 font-mono-display">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono-display">
                          <BookOpen className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-lime transition-colors">
                        {post.title}
                      </h2>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-3xl">
                        {post.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 py-0.5 font-mono-display text-[9px] uppercase tracking-wider text-muted-foreground"
                          >
                            <Tag className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow cue */}
                    <div className="hidden sm:flex h-10 w-10 rounded-full border border-hairline bg-surface items-center justify-center text-muted-foreground group-hover:border-lime group-hover:text-lime group-hover:translate-x-1 transition-all duration-300 mt-2">
                      →
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="text-center py-16 border border-dashed border-hairline rounded-2xl bg-surface/30">
              <p className="text-muted-foreground font-mono-display text-xs uppercase tracking-widest">
                No posts found matching that tag.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
