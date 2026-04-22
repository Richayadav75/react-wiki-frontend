import Link from 'next/link';
import { Topic } from '@/lib/types';
import styles from './TopicCard.module.css';

interface Props {
  topic: Topic;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Hooks':            '🪝',
  'State Management': '🗃',
  'Performance':      '⚡',
  'Patterns':         '🧩',
  'Fundamentals':     '📐',
};

export default function TopicCard({ topic }: Props) {
  const icon = CATEGORY_ICONS[topic.category] ?? '📄';

  return (
    <Link href={`/topic/${topic.slug}`} className={styles.card} id={`card-${topic.slug}`}>
      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <span className={`${styles.diffBadge} ${styles[topic.difficulty.toLowerCase()]}`}>
          {topic.difficulty}
        </span>
      </div>

      <h2 className={styles.title}>{topic.name}</h2>
      <p className={styles.category}>{topic.category}</p>

      {topic.related && topic.related.length > 0 && (
        <div className={styles.related}>
          {topic.related.slice(0, 3).map(r => (
            <span key={r} className={styles.relatedTag}>{r}</span>
          ))}
        </div>
      )}

      <div className={styles.arrow}>→</div>
    </Link>
  );
}
