import ReactMarkdown from "react-markdown";
import { getLanguageClasses } from "@/lib/language-utils";

interface MarkdownRendererProps {
  content: string;
  language?: "urdu" | "english";
}

export default function MarkdownRenderer({ content, language = "english" }: MarkdownRendererProps) {
  const languageClasses = getLanguageClasses(language);
  const isUrdu = language === "urdu";

  return (
    <div className={languageClasses}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className={`text-lg font-bold mt-3 mb-2 text-foreground ${isUrdu ? "text-right" : "text-left"}`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`text-base font-bold mt-3 mb-1.5 text-foreground ${isUrdu ? "text-right" : "text-left"}`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`text-sm font-bold mt-2 mb-1 text-foreground ${isUrdu ? "text-right" : "text-left"}`}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className={`mb-2 last:mb-0 leading-relaxed ${isUrdu ? "text-right" : "text-left"}`}>
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/90">{children}</em>
          ),
          ul: ({ children }) => (
            <ul
              className={`list-disc mb-2 space-y-1 ${isUrdu ? "pr-5 text-right" : "pl-5 text-left"}`}
              style={isUrdu ? { direction: "rtl", textAlign: "right" } : undefined}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal mb-2 space-y-1 ${isUrdu ? "pr-5 text-right" : "pl-5 text-left"}`}
              style={isUrdu ? { direction: "rtl", textAlign: "right" } : undefined}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className={`leading-relaxed ${isUrdu ? "pr-1" : "pl-1"}`}
              style={isUrdu ? { direction: "rtl", textAlign: "right" } : undefined}
            >
              {children}
            </li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-muted/50 px-1.5 py-0.5 rounded text-xs font-mono text-cyan-300">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-muted/50 border border-border/50 rounded-lg p-3 mb-2 overflow-x-auto text-xs">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`${isUrdu ? "border-r-2 pr-3" : "border-l-2 pl-3"} border-cyan-500/50 my-2 text-muted-foreground italic`}>
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-border/50 my-3" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}