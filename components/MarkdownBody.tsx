import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownBody({ body }: { body: string }) {
  if (!body.trim()) return null;

  // If content has no markdown indicators, treat as plain text (legacy support)
  const hasMarkdown = /[#*_\[\]`>-]/.test(body);

  if (!hasMarkdown) {
    const paragraphs = body.split(/\n\n+/).filter(Boolean);
    return (
      <div className="space-y-6 max-w-prose border-t border-parchment-200 pt-5">
        {paragraphs.map((p, i) => (
          <p key={i} className="text-stone-700 leading-relaxed text-base">{p.replace(/\n/g, ' ')}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="prose-ww max-w-prose border-t border-parchment-200 pt-5">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
    </div>
  );
}
