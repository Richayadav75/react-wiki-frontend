import styles from "../assets/styles/components/TopicCard.module.scss";
import { Topic } from "@/lib/types";

interface Props {
  topic: Topic;
  index: number;
  isSelected?: boolean;
  isRead?: boolean;
  onSelect: () => void;
  onToggleRead: (e: React.MouseEvent) => void;
}

export default function TopicCard({ topic, index, isSelected, isRead, onSelect, onToggleRead }: Props) {
  const diffClass = topic.difficulty.toLowerCase();

  return (
    <tr
      className={`${styles.probRow} ${isSelected ? styles.active : ''}`}
      onClick={onSelect}
    >
      <td className={styles.probNumCell}>{String(index + 1).padStart(2, "0")}</td>
      <td style={{ paddingRight: 0, width: '24px', verticalAlign: 'middle' }}>
        <span 
          className={`${styles.checkCircle} ${isRead ? styles.checked : ''}`}
          onClick={onToggleRead}
          style={{ cursor: 'pointer' }}
        >
          {isRead && <span style={{ color: '#16a34a', fontSize: '14px' }}>✓</span>}
        </span>
      </td>
      <td className={styles.probTitleCell}>
        <span className={styles.probTitleLink} style={{ textDecoration: isRead ? 'line-through' : 'none', color: isRead ? 'var(--ink3)' : 'inherit' }}>{topic.name}</span>
        <span className={styles.probByline}>
          {topic.category}
        </span>
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <span className={`${styles.diffPill} ${styles[diffClass]}`}>{topic.difficulty}</span>
      </td>
      <td className={styles.probArrowCell}>
        <button className={styles.readBtn} onClick={onToggleRead}>
          {isRead ? 'UNREAD' : 'READ'}
        </button>
      </td>
    </tr>
  );
}
