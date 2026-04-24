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

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.container}>
            <div className={styles.toolbar}>
                <span className={styles.langBadge}>{language.toUpperCase()}</span>
                <div className={styles.actions}>
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
                        style={vs}
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
            
            <div className={styles.footer}>
                <p className={styles.hint}>You can edit the code above to practice!</p>
            </div>
        </div>
    );
}
