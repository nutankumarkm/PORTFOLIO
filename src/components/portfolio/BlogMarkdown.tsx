import ReactMarkdown from "react-markdown";

/**
 * Renders a post's markdown body. Deliberately a server component: the parser
 * and its remark/micromark dependencies run once at build time, and the browser
 * receives plain HTML instead of ~118KB of markdown tooling to re-parse the
 * same static text on every visit.
 *
 * Element renderers below do the styling; the typography plugin is not
 * installed, so no `prose` classes are used here.
 */
export function BlogMarkdown({ content }: { content: string }) {
  return (
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
  );
}
