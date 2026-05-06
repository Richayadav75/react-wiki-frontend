import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check, Play } from 'lucide-react';
import styles from '../assets/styles/components/PracticeEditor.module.scss';

interface PracticeEditorProps {
    initialCode: string;
    language?: string;
}

export default function PracticeEditor({ initialCode, language = 'javascript' }: PracticeEditorProps) {
    const [code, setCode] = useState(initialCode);
    const [copied, setCopied] = useState(false);
    const [output, setOutput] = useState<string[]>([]);

    useEffect(() => {
        setCode(initialCode);
        setOutput([]);
    }, [initialCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRun = () => {
        const logs: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
            logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
            originalConsoleLog(...args);
        };
        try {
            // Basic execution, works well for standard JS concepts
            // eslint-disable-next-line no-new-func
            new Function(code)();
            if (logs.length === 0) logs.push("Execution finished with no output.");
        } catch (e) {
            logs.push(`Error: ${(e as Error).message}`);
        }
        console.log = originalConsoleLog;
        setOutput(logs);
    };

    const modifiedStyle = {
        ...vs,
        'comment': { color: '#5c6370', fontStyle: 'italic' },
        'prolog': { color: '#5c6370', fontStyle: 'italic' },
        'doctype': { color: '#5c6370', fontStyle: 'italic' },
        'cdata': { color: '#5c6370', fontStyle: 'italic' },
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <span className={styles.langBadge}>{language.toUpperCase()}</span>
                <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={handleRun} style={{ color: '#3b82f6' }}>
                        <Play size={14} />
                        <span>Run</span>
                    </button>
                    <button className={styles.actionBtn} onClick={handleCopy}>
                        {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
            </div>
            
            <div className={styles.editorWrapper}>
                <textarea
                    className={styles.textarea}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                />
                <div className={styles.highlighter}>
                    <SyntaxHighlighter
                        language={language}
                        style={modifiedStyle}
                        customStyle={{
                            margin: 0,
                            padding: '16px',
                            fontSize: '13px',
                            fontFamily: 'var(--mono)',
                            backgroundColor: 'transparent',
                            pointerEvents: 'none',
                        }}
                    >
                        {code + (code.endsWith('\n') ? ' ' : '')}
                    </SyntaxHighlighter>
                </div>
            </div>

            {output.length > 0 && (
                <div style={{ padding: '12px', backgroundColor: '#1e1e1e', color: '#d4d4d4', fontFamily: 'var(--mono)', fontSize: '13px', borderTop: '1px solid var(--rule-light)' }}>
                    <div style={{ marginBottom: '8px', color: '#888', fontSize: '11px', textTransform: 'uppercase' }}>Console Output</div>
                    {output.map((line, i) => (
                        <div key={i} style={{ whiteSpace: 'pre-wrap', color: line.startsWith('Error:') ? '#ef4444' : 'inherit' }}>{line}</div>
                    ))}
                </div>
            )}
            
            <div className={styles.footer}>
                <p className={styles.hint}>You can edit the code above to practice!</p>
            </div>
        </div>
    );
}
