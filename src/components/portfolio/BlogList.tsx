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
    <div className="relative flex min-h-screen flex-col bg-base-100">
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
              className="btn btn-ghost btn-sm gap-2 font-mono-display text-xs uppercase tracking-widest"
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
          className="mt-6 max-w-2xl text-base leading-relaxed text-base-content/70 sm:text-lg"
        >
          In-depth technical write-ups, engineering notes, and logbook entries detailing RAG pipelines, distributed algorithms, and model fine-tuning.
        </motion.p>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-2 border-b border-base-300 pb-6"
          >
            <button
              onClick={() => setSelectedTag(null)}
              aria-pressed={selectedTag === null}
              className={`btn btn-sm rounded-full font-mono-display text-[10px] uppercase tracking-widest ${
                selectedTag === null ? "btn-primary" : "btn-outline"
              }`}
            >
              All Posts
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
                className={`btn btn-sm rounded-full font-mono-display text-[10px] uppercase tracking-widest ${
                  selectedTag === tag ? "btn-primary" : "btn-outline"
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
                  className="card group relative overflow-hidden border border-base-300 bg-base-200/40 transition-colors hover:border-base-content/20 hover:bg-base-200/70"
                >
                  {/* Hover accent rail */}
                  <div className="absolute inset-y-0 left-0 w-[2px] origin-center scale-y-0 bg-primary transition-transform duration-300 group-hover:scale-y-100" />

                  <div className="card-body flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1 space-y-3">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-base-content/60">
                        <span className="flex items-center gap-1.5 font-mono-display">
                          <Calendar className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1.5 font-mono-display">
                          <BookOpen className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="card-title font-display text-xl font-bold transition-colors group-hover:text-primary sm:text-2xl">
                        {post.title}
                      </h2>

                      <p className="max-w-3xl text-sm leading-relaxed text-base-content/70">
                        {post.description}
                      </p>

                      <div className="card-actions flex-wrap gap-1.5 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="badge badge-outline badge-sm gap-1 font-mono-display text-[9px] uppercase tracking-wider"
                          >
                            <Tag className="h-2 w-2" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow cue */}
                    <div className="btn btn-circle btn-outline btn-sm mt-2 hidden transition-all duration-300 group-hover:translate-x-1 group-hover:btn-primary sm:flex">
                      →
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))
          ) : (
            <div className="card card-dash border-base-300 bg-base-200/30 py-16 text-center">
              <p className="font-mono-display text-xs uppercase tracking-widest text-base-content/60">
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
