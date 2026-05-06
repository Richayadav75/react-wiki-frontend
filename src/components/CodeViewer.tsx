import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
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
                style={oneLight}
                customStyle={{
                    margin: 0,
                    padding: '18px 20px',
                    fontSize: '15px',
                    fontFamily: '"Fira Code", "JetBrains Mono", "Cascadia Code", monospace',
                    lineHeight: '1.75',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    );
}
