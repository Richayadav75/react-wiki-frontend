'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css';
import styles from './MarkdownRenderer.module.css';

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  // Strip the front-matter lines (lines starting with "- Key: Value") from display
  const stripped = content.replace(/^(- \w[\w\s]*:.*\n)+\n?/, '');

  return (
    <article className={styles.article}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {stripped}
      </ReactMarkdown>
    </article>
  );
}
