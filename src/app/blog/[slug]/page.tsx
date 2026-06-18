import { notFound } from "next/navigation";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/blog";
import { BlogPostDetail } from "@/components/portfolio/BlogPostDetail";
import type { Metadata } from "next";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata dynamically for SEO
export async function generateMetadata({ params }: RouteParams): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.metadata.title} — KM Nutankumar`,
    description: post.metadata.description,
    openGraph: {
      title: post.metadata.title,
      description: post.metadata.description,
      type: "article",
    },
  };
}

// Define generateStaticParams to allow Next.js to pre-render the blog posts at build time
export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: RouteParams) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostDetail post={post} />;
}
