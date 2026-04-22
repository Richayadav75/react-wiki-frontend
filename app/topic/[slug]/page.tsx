import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchTopicDetail, fetchTopicList } from '@/lib/github';
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer';
import styles from './TopicPage.module.css';
import type { Metadata } from 'next';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const topic = await fetchTopicDetail(params.slug);
  if (!topic) return { title: 'Topic Not Found — React Wiki' };
  return {
    title: `${topic.name} — React Wiki`,
    description: `Learn about ${topic.name} in React. Category: ${topic.category}. Difficulty: ${topic.difficulty}.`,
  };
}

export async function generateStaticParams() {
  try {
    const topics = await fetchTopicList();
    return topics.map(t => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

const CATEGORY_ICONS: Record<string, string> = {
  'Hooks':            '🪝',
  'State Management': '🗃',
  'Performance':      '⚡',
  'Patterns':         '🧩',
  'Fundamentals':     '📐',
};

export default async function TopicPage({ params }: Props) {
  const topic = await fetchTopicDetail(params.slug);

  if (!topic) notFound();

  const icon = CATEGORY_ICONS[topic.category] ?? '📄';

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        {/* Back link */}
        <Link href="/" className={styles.back} id="back-to-topics">
          ← All Topics
        </Link>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.icon}>{icon}</span>
            <div className={styles.badges}>
              <span className={styles.categoryBadge}>{topic.category}</span>
              <span className={`${styles.diffBadge} ${styles[topic.difficulty.toLowerCase()]}`}>
                {topic.difficulty}
              </span>
            </div>
          </div>

          <h1 className={styles.title}>{topic.name}</h1>

          {topic.related && topic.related.length > 0 && (
            <div className={styles.related}>
              <span className={styles.relatedLabel}>Related:</span>
              {topic.related.map(r => (
                <span key={r} className={styles.relatedTag}>{r}</span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className={styles.content}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Quick Info</h3>
              <dl className={styles.dl}>
                <dt>Category</dt>
                <dd>{topic.category}</dd>
                <dt>Difficulty</dt>
                <dd className={styles[topic.difficulty.toLowerCase()]}>{topic.difficulty}</dd>
              </dl>
            </div>

            <div className={styles.sideCard}>
              <h3 className={styles.sideTitle}>Resources</h3>
              <ul className={styles.resourceList}>
                <li>
                  <a href="https://react.dev/reference/react" target="_blank" rel="noopener noreferrer">
                    React Docs ↗
                  </a>
                </li>
                <li>
                  <a href="https://react.dev/learn" target="_blank" rel="noopener noreferrer">
                    React Learn ↗
                  </a>
                </li>
              </ul>
            </div>
          </aside>

          {/* Main article */}
          <main className={styles.main}>
            <MarkdownRenderer content={topic.content} />
          </main>
        </div>
      </div>
    </div>
  );
}
