import styles from '../assets/styles/components/FlowChart.module.scss';

interface FlowChartProps {
    content: string; // raw markdown content
}

interface FlowNode {
    label: string;
    sub?: string;
}

interface FlowStep {
    from: FlowNode;
    to: FlowNode;
    label?: string;
}

interface FlowDiagram {
    title: string;
    steps: FlowStep[];
    raw: string; // original text for fallback
}

// Parse a node label like "[ Variable ]" or "(age)" or "Direct Value"
function parseNodeLabel(raw: string): FlowNode {
    const s = raw.trim();
    // [ ... ] → box node
    const boxMatch = s.match(/^\[(.+)\]$/);
    if (boxMatch) return { label: boxMatch[1].trim() };
    // ( ... ) → sub-label / detail
    const parenMatch = s.match(/^\((.+)\)$/);
    if (parenMatch) return { label: parenMatch[1].trim(), sub: 'detail' };
    return { label: s };
}

// Split a line by "-->" or "→" arrows
function parseLine(line: string): FlowStep | null {
    const arrowSplit = line.split(/-->|→/);
    if (arrowSplit.length < 2) return null;
    const from = parseNodeLabel(arrowSplit[0]);
    const to = parseNodeLabel(arrowSplit[arrowSplit.length - 1]);
    const label = arrowSplit.length === 3 ? arrowSplit[1].trim() : undefined;
    if (!from.label || !to.label) return null;
    return { from, to, label };
}

// Extract all Working Flow diagrams from content
function extractFlowDiagrams(content: string): FlowDiagram[] {
    const diagrams: FlowDiagram[] = [];

    // Match sections: **Working Flow** followed by ```text ... ```
    const sectionRegex = /\*\*Working Flow\*\*[\s\S]*?```(?:text)?\n([\s\S]*?)```/gi;
    // Also match headings like "### Working Flow"
    const headingRegex = /(?:###?\s*)?Working Flow[\s\S]*?```(?:text)?\n([\s\S]*?)```/gi;

    const combined = new Set<string>();
    let m: RegExpExecArray | null;

    for (const rx of [sectionRegex, headingRegex]) {
        rx.lastIndex = 0;
        while ((m = rx.exec(content)) !== null) {
            combined.add(m[1]);
        }
    }

    let idx = 0;
    for (const blockText of combined) {
        const steps: FlowStep[] = [];
        const lines = blockText.split('\n').map(l => l.trim()).filter(Boolean);

        // Group paired lines: "[ A ] --> [ B ]" and "  (a)  -->  (b)"
        // Each line that has --> is a step
        for (const line of lines) {
            const step = parseLine(line);
            if (step) steps.push(step);
        }

        // If we got steps, merge paren lines into the previous step as sub-labels
        const merged: FlowStep[] = [];
        for (const step of steps) {
            const isSubLine =
                step.from.sub === 'detail' || step.to.sub === 'detail';
            if (isSubLine && merged.length > 0) {
                const prev = merged[merged.length - 1];
                if (!prev.from.sub) prev.from.sub = step.from.label;
                if (!prev.to.sub) prev.to.sub = step.to.label;
            } else {
                merged.push({ ...step });
            }
        }

        diagrams.push({
            title: idx === 0 ? 'Working Flow' : `Working Flow ${idx + 1}`,
            steps: merged,
            raw: blockText,
        });
        idx++;
    }

    return diagrams;
}

// Single box node
function NodeBox({ node }: { node: FlowNode }) {
    return (
        <div className={styles.node}>
            <span className={styles.nodeLabel}>{node.label}</span>
            {node.sub && node.sub !== 'detail' && (
                <span className={styles.nodeSub}>{node.sub}</span>
            )}
        </div>
    );
}

// Arrow between nodes
function Arrow({ label }: { label?: string }) {
    return (
        <div className={styles.arrow}>
            <div className={styles.arrowLine} />
            {/* {label && <span className={styles.arrowLabel}>{label}</span>} */}
            <div className={styles.arrowHead}>▶</div>
        </div>
    );
}

// One step row: [from] --> [to]
function FlowRow({ step }: { step: FlowStep }) {
    return (
        <div className={styles.row}>
            <NodeBox node={step.from} />
            <Arrow label={step.label} />
            <NodeBox node={step.to} />
        </div>
    );
}

export default function FlowChart({ content }: FlowChartProps) {
    const diagrams = extractFlowDiagrams(content);

    if (diagrams.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>⬡</span>
                <p>No flow diagram found for this topic.</p>
                <p className={styles.emptyHint}>
                    Add a <code>**Working Flow**</code> section with a{' '}
                    <code>```text</code> block to your README.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {diagrams.map((diagram, di) => (
                <div key={di} className={styles.diagram}>
                    <span className={styles.diagramTitle}>{diagram.title}</span>
                    {diagram.steps.length > 0 ? (
                        <div className={styles.flowBody}>
                            {diagram.steps.map((step, si) => (
                                <FlowRow key={si} step={step} />
                            ))}
                        </div>
                    ) : (
                        // Fallback: render raw text in a styled pre
                        <pre className={styles.rawFallback}>{diagram.raw}</pre>
                    )}
                </div>
            ))}
        </div>
    );
}
