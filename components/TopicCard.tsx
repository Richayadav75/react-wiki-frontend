"use client";

import styles from "./TopicCard.module.css";
import { Topic } from "@/lib/types";

interface Props {
  topic: Topic;
  index: number;
  isSelected?: boolean;
  onSelect: () => void;
}

export default function TopicCard({ topic, index, isSelected, onSelect }: Props) {
  const diffClass = topic.difficulty.toLowerCase();

  return (
    <tr
      className={`${styles.probRow} ${isSelected ? styles.active : ''}`}
      onClick={onSelect}
    >
      <td className={styles.probNumCell}>{String(index + 1).padStart(2, "0")}</td>
      <td style={{ paddingRight: 0, width: '24px', verticalAlign: 'middle' }}>
        <span className={`${styles.checkCircle}`}></span>
      </td>
      <td className={styles.probTitleCell}>
        <span className={styles.probTitleLink}>{topic.name}</span>
        <span className={styles.probByline}>
          {topic.category}
        </span>
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
        <span className={`${styles.diffPill} ${styles[diffClass]}`}>{topic.difficulty}</span>
      </td>
      <td className={styles.probArrowCell}>
        <button className={styles.readBtn}>READ</button>
      </td>
    </tr>
  );
}
