"use client";

import { useState, useEffect } from "react";
import { TopicDetail } from "@/lib/types";
import CodeViewer from "@/components/CodeViewer";
import ReactMarkdown from "react-markdown";
import { Maximize2, Minimize2, X } from "lucide-react";
import styles from "./TopicPanel.module.css";

interface TopicPanelProps {
    topic: TopicDetail | null;
    isOpen: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onClose: () => void;
    error?: string | null;
}

export default function TopicPanel({ topic, isOpen, isExpanded, onToggleExpand, onClose, error }: TopicPanelProps) {
    const [activeTab, setActiveTab] = useState<'concept' | 'practice' | 'interview' | 'notes'>('concept');

    useEffect(() => {
        if (topic) {
            setActiveTab('concept');
        }
    }, [topic]);

    if (!topic) return null;

    const isSkeletal = !('content' in topic) || !topic.content;
    const diffClass = topic.difficulty?.toLowerCase() || 'medium';

    return (
        <aside className={`${styles.panel} ${isOpen ? styles.open : ''} ${isExpanded ? styles.expanded : ''}`}>
            <div className={styles.panelMasthead}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.mastheadGroup}>
                        <span className={styles.panelSectionTag}>Concept · {topic.category}</span>
                        <h1 className={styles.panelHeadline}>{topic.name}</h1>
                    </div>
                    <div className={styles.panelActionGroup}>
                        <button
                            className={styles.expandBtn}
                            onClick={onToggleExpand}
                            title={isExpanded ? 'Reduce' : 'Expand Focus'}
                        >
                            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            className={styles.panelClose}
                            onClick={onClose}
                            title="Close Panel"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.panelTabs}>
                <button
                    className={`${styles.ptab} ${activeTab === 'concept' ? styles.ptabActive : ''}`}
                    onClick={() => setActiveTab('concept')}
                >
                    Concept
                </button>
                <button
                    className={`${styles.ptab} ${activeTab === 'practice' ? styles.ptabActive : ''}`}
                    onClick={() => setActiveTab('practice')}
                >
                    Practice
                </button>
                <button
                    className={`${styles.ptab} ${activeTab === 'interview' ? styles.ptabActive : ''}`}
                    onClick={() => setActiveTab('interview')}
                >
                    Interview
                </button>
                <button
                    className={`${styles.ptab} ${activeTab === 'notes' ? styles.ptabActive : ''}`}
                    onClick={() => setActiveTab('notes')}
                >
                    Notes
                </button>
            </div>

            <div className={styles.panelBody}>
                {/* CONCEPT TAB */}
                {activeTab === 'concept' && (
                    <div id="tab-concept">
                        <div className={styles.panelBadges}>
                            <span className={`${styles.diffPill} ${styles[diffClass] || ''}`}>{topic.difficulty}</span>
                            <span className={styles.panelComplexity}>
                                Related: {topic.related?.join(', ') || 'None'}
                            </span>
                        </div>
                        <span className={styles.colKicker}>Explanation</span>
                        <div className={styles.panelBodyText}>
                            {error ? (
                                <div className={styles.errorState}>
                                    ✕ {error}
                                </div>
                            ) : isSkeletal ? (
                                <div className={styles.loadingState}>
                                    <span className={styles.spinner}></span> Consulting GitHub...
                                </div>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            // Handle react-syntax-highlighter
                                            if (match) {
                                                return <CodeViewer code={String(children).replace(/\n$/, '')} language={match[1]} />;
                                            }
                                            return <code className={className} {...props}>{children}</code>;
                                        }
                                    }}
                                >
                                    {topic.content || ''}
                                </ReactMarkdown>
                            )}
                        </div>
                    </div>
                )}

                {/* PRACTICE TAB */}
                {activeTab === 'practice' && (
                    <div id="tab-practice">
                        <div className={styles.practiceHeader}>
                            <span className={styles.colKicker}>Hands-on Coding</span>
                            <p className={styles.practiceSub}>Study this implementation to master the concept.</p>
                        </div>
                        {topic.practiceCode ? (
                            <div className={styles.codeWorkspace}>
                                <CodeViewer code={topic.practiceCode} language="tsx" />
                            </div>
                        ) : (
                            <div className={styles.emptyState}>No practice code available yet for this topic.</div>
                        )}
                    </div>
                )}

                {/* INTERVIEW TAB */}
                {activeTab === 'interview' && (
                    <div id="tab-interview">
                        <span className={styles.colKicker}>Interview Prep</span>
                        <div className={styles.panelBodyText}>
                            {topic.interviewQuestions ? (
                                <ReactMarkdown>{topic.interviewQuestions}</ReactMarkdown>
                            ) : (
                                <div className={styles.emptyState}>No interview questions available yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <div id="tab-notes">
                        <span className={styles.colKicker} style={{ marginTop: 0 }}>Your notes</span>
                        <textarea className={styles.notesArea} placeholder="Your mental model, gotchas, code snippets..."></textarea>
                        <button className={styles.notesSave}>Save</button>
                    </div>
                )}
            </div>
        </aside>
    );
}
