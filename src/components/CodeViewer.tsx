import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';
import styles from '../assets/styles/components/CodeViewer.module.scss';

interface CodeViewerProps {
    code: string;
    language?: string;
}

export default function CodeViewer({ code, language = 'javascript' }: CodeViewerProps) {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.wrapper}>
            <button 
                className={styles.copyBtn} 
                onClick={handleCopy}
                title="Copy Code"
            >
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            </button>
            <SyntaxHighlighter
                language={language}
                style={vs}
                customStyle={{
                    margin: 0,
                    padding: '16px',
                    fontSize: '12px',
                    fontFamily: 'var(--mono)',
                    backgroundColor: 'var(--paper2)',
                    border: '1px solid var(--rule-light)',
                    borderRadius: '4px',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
