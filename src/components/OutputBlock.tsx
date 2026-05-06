import styles from '../assets/styles/components/OutputBlock.module.scss';

interface OutputBlockProps {
    text: string;
}

export default function OutputBlock({ text }: OutputBlockProps) {
    const lines = text.split('\n').filter(line => line.trim() !== '');

    return (
        <div className={styles.outputWrapper}>
            <span className={styles.outputLabel}>▶ Output</span>
            <div className={styles.outputBody}>
                {lines.map((line, i) => (
                    <div key={i} className={styles.outputLine}>
                        <span className={styles.lineIndex}>{i + 1}</span>
                        <span className={styles.lineValue}>{line}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
