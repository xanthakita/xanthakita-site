import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// react-markdown does not render raw HTML unless rehype-raw is added, so any
// <script>/<img onerror> in a README is inert. GFM enables tables/task-lists.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
