import fs from "fs";
import path from "path";

export interface BlogPostMetadata {
  title: string;
  date: string;
  description: string;
  tags: string[];
  readTime: string;
  slug: string;
}

export interface BlogPost {
  metadata: BlogPostMetadata;
  content: string;
}

const postsDirectory = path.join(process.cwd(), "src/content/blog");

// Custom lightweight markdown parser to extract frontmatter without external dependencies
function parseMarkdown(fileContent: string): { metadata: Record<string, string>; content: string } {
  const parts = fileContent.split("---");
  
  if (parts.length < 3) {
    return { metadata: {}, content: fileContent };
  }
  
  const frontmatter = parts[1];
  const content = parts.slice(2).join("---");
  const metadata: Record<string, string> = {};
  
  frontmatter.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > -1) {
      const key = line.substring(0, colonIndex).trim();
      let val = line.substring(colonIndex + 1).trim();
      
      // Clean leading and trailing quotes from values
      val = val.replace(/^["']|["']$/g, "").trim();
      if (key) {
        metadata[key] = val;
      }
    }
  });
  
  return { metadata, content };
}

export function getBlogPosts(): BlogPostMetadata[] {
  // Ensure the content directory exists
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      
      const { metadata } = parseMarkdown(fileContents);
      
      const tags = metadata.tags
        ? metadata.tags
            .replace(/[\[\]]/g, "")
            .split(",")
            .map((t) => t.trim().replace(/^["']|["']$/g, ""))
        : [];

      return {
        slug,
        title: metadata.title || "Untitled Post",
        date: metadata.date || "2026-01-01",
        description: metadata.description || "",
        tags,
        readTime: metadata.readTime || "5 min read",
      } as BlogPostMetadata;
    });

  // Sort posts by date descending
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { metadata, content } = parseMarkdown(fileContents);
    
    const tags = metadata.tags
      ? metadata.tags
          .replace(/[\[\]]/g, "")
          .split(",")
          .map((t) => t.trim().replace(/^["']|["']$/g, ""))
      : [];

    return {
      metadata: {
        slug,
        title: metadata.title || "Untitled Post",
        date: metadata.date || "2026-01-01",
        description: metadata.description || "",
        tags,
        readTime: metadata.readTime || "5 min read",
      },
      content,
    };
  } catch (e) {
    return null;
  }
}
