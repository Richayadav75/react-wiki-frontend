interface StatCellProps {
    val: string | number;
    label: string;
}

/**
 * Single Stat Cell for the Hero section
 */
export default function StatCell({ val, label }: StatCellProps) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div className="wiki-app__stat-cell-val">{val}</div>
            <div className="wiki-app__stat-cell-lbl">{label}</div>
        </div>
    );
}
