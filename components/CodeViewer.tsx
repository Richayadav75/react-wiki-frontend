import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import styles from './CodeViewer.module.css';

interface CodeViewerProps {
    code: string;
    language?: string;
}

export default function CodeViewer({ code, language = 'javascript' }: CodeViewerProps) {
    return (
        <div className={styles.wrapper}>
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
