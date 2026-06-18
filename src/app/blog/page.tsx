import { getBlogPosts } from "@/lib/blog";
import { BlogList } from "@/components/portfolio/BlogList";

export const metadata = {
  title: "Logbook — KM Nutankumar",
  description:
    "Engineering logs, code tutorials, and deep-dives written by KM Nutankumar, AI Engineer.",
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();
  return <BlogList posts={posts} />;
}
