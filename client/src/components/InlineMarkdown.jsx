import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// Renders one line of markdown with inline LaTeX ($...$) and no block-level
// <p> wrapper, so it is safe to nest inside a <button> or other inline flow.
const COMPONENTS = { p: ({ children }) => <>{children}</> };

export default function InlineMarkdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={COMPONENTS}
    >
      {children}
    </ReactMarkdown>
  );
}
