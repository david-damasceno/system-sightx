
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  isAI?: boolean;
}

const MarkdownRenderer = ({ content, isAI = false }: MarkdownRendererProps) => {
  return (
    <div className={cn(
      "prose prose-sm max-w-none",
      isAI ? "prose-invert" : "prose-slate"
    )}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className={cn(
              "text-xl font-bold mt-6 mb-4 first:mt-0",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={cn(
              "text-lg font-semibold mt-5 mb-3 first:mt-0",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={cn(
              "text-base font-semibold mt-4 mb-2 first:mt-0",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </h3>
          ),
          // Paragraphs
          p: ({ children }) => (
            <p className={cn(
              "mb-3 last:mb-0 leading-relaxed",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </p>
          ),
          // Lists
          ul: ({ children }) => (
            <ul className={cn(
              "list-disc pl-6 mb-3 space-y-1",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={cn(
              "list-decimal pl-6 mb-3 space-y-1",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={cn(
              "leading-relaxed",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </li>
          ),
          // Code blocks
          code: ({ children, className, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !className;
            
            if (isInline) {
              return (
                <code 
                  className={cn(
                    "px-1.5 py-0.5 rounded text-sm font-mono",
                    isAI 
                      ? "bg-white/20 text-white" 
                      : "bg-muted text-foreground"
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <pre className={cn(
                "bg-muted/50 rounded-md p-4 my-4 overflow-x-auto",
                "border border-border"
              )}>
                <code 
                  className={cn(
                    "text-sm font-mono",
                    isAI ? "text-white" : "text-foreground"
                  )}
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          },
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={cn(
              "border-l-4 pl-4 my-4 italic",
              isAI 
                ? "border-white/30 text-white/90" 
                : "border-muted-foreground/30 text-muted-foreground"
            )}>
              {children}
            </blockquote>
          ),
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className={cn(
                "min-w-full border-collapse border",
                isAI ? "border-white/20" : "border-border"
              )}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className={cn(
              "border px-4 py-2 text-left font-semibold",
              isAI 
                ? "border-white/20 bg-white/10 text-white" 
                : "border-border bg-muted/50 text-foreground"
            )}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className={cn(
              "border px-4 py-2",
              isAI 
                ? "border-white/20 text-white" 
                : "border-border text-foreground"
            )}>
              {children}
            </td>
          ),
          // Links
          a: ({ children, href }) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "underline hover:no-underline transition-colors",
                isAI 
                  ? "text-blue-300 hover:text-blue-200" 
                  : "text-primary hover:text-primary/80"
              )}
            >
              {children}
            </a>
          ),
          // Strong/Bold
          strong: ({ children }) => (
            <strong className={cn(
              "font-semibold",
              isAI ? "text-white" : "text-foreground"
            )}>
              {children}
            </strong>
          ),
          // Emphasis/Italic
          em: ({ children }) => (
            <em className={cn(
              "italic",
              isAI ? "text-white/90" : "text-foreground/90"
            )}>
              {children}
            </em>
          ),
          // Horizontal rule
          hr: () => (
            <hr className={cn(
              "my-6 border-t",
              isAI ? "border-white/20" : "border-border"
            )} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
