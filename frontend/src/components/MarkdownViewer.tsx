import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyButton } from './CopyButton';

export const MarkdownViewer = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-p:leading-relaxed prose-pre:bg-transparent prose-pre:p-0 prose-a:text-primary prose-headings:text-foreground prose-strong:text-foreground text-muted-foreground w-full break-words max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');
            return !inline && match ? (
              <div className="rounded-md overflow-hidden border border-[rgba(255,255,255,0.08)] my-4 relative group/code bg-[#0F243D]">
                <div className="px-4 py-1.5 text-xs font-mono text-muted-foreground border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center bg-[#162B4A]">
                  <span>{match[1]}</span>
                  <CopyButton text={codeString} className="w-6 h-6 p-1 bg-transparent hover:bg-white/10 text-[#94A3B8]" />
                </div>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  className="!m-0 !p-4 !bg-transparent text-sm"
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code {...props} className={className ? className + " bg-muted px-1.5 py-0.5 rounded text-primary text-sm font-mono" : "bg-muted px-1.5 py-0.5 rounded text-primary text-sm font-mono"}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
