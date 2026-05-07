import { useState, useEffect } from "react";
import { TopicDetail } from "@/lib/types";
import CodeViewer from "@/components/CodeViewer";
import OutputBlock from "@/components/OutputBlock";
import FlowChart from "@/components/FlowChart";
import PracticeEditor from "@/components/PracticeEditor";
import ReactMarkdown from "react-markdown";
import { Maximize2, Minimize2, X } from "lucide-react";
import styles from "../assets/styles/components/TopicPanel.module.scss";

interface TopicPanelProps {
    topic: TopicDetail | null;
    isOpen: boolean;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onClose: () => void;
    error?: string | null;
}

type ActiveTab = 'concept' | 'practice' | 'interview' | 'flow' | 'notes';

export default function TopicPanel({ topic, isOpen, isExpanded, onToggleExpand, onClose, error }: TopicPanelProps) {
    const [activeTab, setActiveTab] = useState<ActiveTab>('concept');

    useEffect(() => {
        if (topic) {
            setActiveTab('concept');
        }
    }, [topic]);

    if (!topic) return null;

    const cleanContent = (content: string) => {
        return content
            .split('\n')
            .filter(line => !line.trim().startsWith('- Category:') && !line.trim().startsWith('- Difficulty:') && !line.trim().startsWith('- Related:'))
            .join('\n')
            .trim();
    };

    const isSkeletal = !('content' in topic) || !topic.content;
    const diffClass = topic.difficulty?.toLowerCase() || 'medium';

    const tabs: { id: ActiveTab; label: string }[] = [
        { id: 'concept', label: 'Concept' },
        { id: 'practice', label: 'Practice' },
        { id: 'interview', label: 'Interview' },
        { id: 'flow', label: 'Flow' },
        { id: 'notes', label: 'Notes' },
    ];

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

            {/* TABS */}
            <div className={styles.panelTabs}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`${styles.ptab} ${activeTab === tab.id ? styles.ptabActive : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
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
                                <div className={styles.errorState}>✕ {error}</div>
                            ) : isSkeletal ? (
                                <div className={styles.loadingState}>
                                    <span className={styles.spinner}></span> Consulting GitHub...
                                </div>
                            ) : (
                                <ReactMarkdown
                                    components={{
                                        code({ node, className, children, ...props }) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            if (match) {
                                                return <CodeViewer code={String(children).replace(/\n$/, '')} language={match[1]} />;
                                            }
                                            const isBlock = String(children).includes('\n');
                                            if (isBlock) {
                                                return <OutputBlock text={String(children).replace(/\n$/, '')} />;
                                            }
                                            return <code className={className} {...props}>{children}</code>;
                                        },
                                        blockquote({ children }) {
                                            // Flatten children to text to check for keywords
                                            const getChildText = (nodes: any): string => {
                                                if (typeof nodes === 'string') return nodes;
                                                if (Array.isArray(nodes)) return nodes.map(getChildText).join('');
                                                if (nodes?.props?.children) return getChildText(nodes.props.children);
                                                return '';
                                            };
                                            
                                            const textContent = getChildText(children).toLowerCase();
                                            
                                            if (textContent.includes('best practice')) {
                                                return <div className={styles.bestPracticeBox}>{children}</div>;
                                            }
                                            if (textContent.includes('analogy')) {
                                                return <div className={styles.analogyBox}>{children}</div>;
                                            }
                                            return <blockquote className={styles.standardBlockquote}>{children}</blockquote>;
                                        },
                                        img({ src, alt, ...props }) {
                                            const isSmall = alt?.toLowerCase().includes('small');
                                            return (
                                                <img
                                                    src={src}
                                                    alt={alt}
                                                    className={isSmall ? styles.smallImage : ''}
                                                    style={{
                                                        maxWidth: '100%',
                                                        borderRadius: '8px',
                                                        margin: '20px 0',
                                                        display: 'block',
                                                        border: '1px solid var(--rule-light)',
                                                    }}
                                                    {...props}
                                                />
                                            );
                                        },
                                        a({ node, href, children, ...props }) {
                                            if (href && (href === './interview.md' || href.endsWith('interview.md'))) {
                                                return (
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('interview'); }} {...props}>
                                                        {children}
                                                    </a>
                                                );
                                            }
                                            return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
                                        }
                                    }}
                                >
                                    {cleanContent(topic.content || '')}
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
                        <div className={styles.codeWorkspace}>
                            <PracticeEditor initialCode={topic.practiceCode || "// Write your practice code here...\n"} language="tsx" />
                        </div>
                    </div>
                )}

                {/* INTERVIEW TAB */}
                {activeTab === 'interview' && (
                    <div id="tab-interview">
                        <span className={styles.colKicker}>Interview Prep</span>
                        <div className={styles.panelBodyText}>
                            {topic.interviewContent || topic.interviewQuestions ? (
                                <ReactMarkdown>{topic.interviewContent || topic.interviewQuestions || ''}</ReactMarkdown>
                            ) : (
                                <div className={styles.emptyState}>No interview questions available yet.</div>
                            )}
                        </div>
                    </div>
                )}

                {/* FLOW TAB */}
                {activeTab === 'flow' && (
                    <div id="tab-flow">
                        <span className={styles.colKicker}>Flow Diagram</span>
                        {isSkeletal ? (
                            <div className={styles.loadingState}>
                                <span className={styles.spinner}></span> Loading flow data...
                            </div>
                        ) : (
                            <div className={styles.panelBodyText}>
                                {topic.flowContent && (
                                    <ReactMarkdown>{topic.flowContent}</ReactMarkdown>
                                )}
                                <FlowChart content={topic.flowContent || topic.content || ''} />
                            </div>
                        )}
                    </div>
                )}

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <NotesTab slug={topic.slug} repoNote={topic.noteContent} />
                )}
            </div>
        </aside>
    );
}

function NotesTab({ slug, repoNote }: { slug: string; repoNote?: string }) {
    const [note, setNote] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const savedNotes = localStorage.getItem(`wiki_notes_${slug}`);
        if (savedNotes) {
            setNote(savedNotes);
        } else {
            setNote("");
            if (!repoNote) setIsEditing(true);
        }
    }, [slug, repoNote]);

    const handleSave = () => {
        localStorage.setItem(`wiki_notes_${slug}`, note);
        setIsEditing(false);
    };

    return (
        <div id="tab-notes">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className={styles.colKicker} style={{ margin: 0 }}>Your notes (Supports Markdown + Images)</span>
                {!isEditing && (
                    <button className={styles.notesSave} onClick={() => setIsEditing(true)}>
                        {note ? 'Edit' : 'Add Note'}
                    </button>
                )}
            </div>

            {isEditing ? (
                <>
                    <textarea
                        className={styles.notesArea}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={"Your mental model, gotchas, code snippets...\n\nInsert images with: ![alt text](https://image-url.png)"}
                    ></textarea>
                    <button className={styles.notesSave} onClick={handleSave}>Save Notes</button>
                </>
            ) : (
                <div className={styles.notesViewContainer}>
                    {repoNote && (
                        <div className={styles.repoNote} style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed var(--rule-light)' }}>
                            <span className={styles.colKicker} style={{ fontSize: '10px', opacity: 0.7 }}>Pinned from Repository</span>
                            <ReactMarkdown
                                components={{
                                    code({ node, className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        if (match) {
                                            return <CodeViewer code={String(children).replace(/\n$/, '')} language={match[1]} />;
                                        }
                                        const isBlock = String(children).includes('\n');
                                        if (isBlock) {
                                            return <OutputBlock text={String(children).replace(/\n$/, '')} />;
                                        }
                                        return <code className={className} {...props}>{children}</code>;
                                    },
                                    blockquote({ children }) {
                                        const getChildText = (nodes: any): string => {
                                            if (typeof nodes === 'string') return nodes;
                                            if (Array.isArray(nodes)) return nodes.map(getChildText).join('');
                                            if (nodes?.props?.children) return getChildText(nodes.props.children);
                                            return '';
                                        };
                                        const textContent = getChildText(children).toLowerCase();
                                        if (textContent.includes('best practice')) {
                                            return <div className={styles.bestPracticeBox}>{children}</div>;
                                        }
                                        if (textContent.includes('analogy')) {
                                            return <div className={styles.analogyBox}>{children}</div>;
                                        }
                                        return <blockquote className={styles.standardBlockquote}>{children}</blockquote>;
                                    },
                                    img({ src, alt, ...props }) {
                                        const isSmall = alt?.toLowerCase().includes('small');
                                        return (
                                            <img
                                                src={src}
                                                alt={alt || ''}
                                                className={isSmall ? styles.smallImage : ''}
                                                {...props}
                                                style={{
                                                    maxWidth: '100%',
                                                    borderRadius: '6px',
                                                    margin: '12px 0',
                                                    display: 'block',
                                                    border: '1px solid var(--rule-light)',
                                                }}
                                            />
                                        );
                                    },
                                }}
                            >
                                {repoNote}
                            </ReactMarkdown>
                        </div>
                    )}
                    {note ? (
                        <ReactMarkdown
                            components={{
                                code({ node, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    if (match) {
                                        return <CodeViewer code={String(children).replace(/\n$/, '')} language={match[1]} />;
                                    }
                                    const isBlock = String(children).includes('\n');
                                    if (isBlock) {
                                        return <OutputBlock text={String(children).replace(/\n$/, '')} />;
                                    }
                                    return <code className={className} {...props}>{children}</code>;
                                },
                                blockquote({ children }) {
                                    const getChildText = (nodes: any): string => {
                                        if (typeof nodes === 'string') return nodes;
                                        if (Array.isArray(nodes)) return nodes.map(getChildText).join('');
                                        if (nodes?.props?.children) return getChildText(nodes.props.children);
                                        return '';
                                    };
                                    const textContent = getChildText(children).toLowerCase();
                                    if (textContent.includes('best practice')) {
                                        return <div className={styles.bestPracticeBox}>{children}</div>;
                                    }
                                    if (textContent.includes('analogy')) {
                                        return <div className={styles.analogyBox}>{children}</div>;
                                    }
                                    return <blockquote className={styles.standardBlockquote}>{children}</blockquote>;
                                },
                                img({ src, alt, ...props }) {
                                    const isSmall = alt?.toLowerCase().includes('small');
                                    return (
                                        <img
                                            src={src}
                                            alt={alt || ''}
                                            className={isSmall ? styles.smallImage : ''}
                                            {...props}
                                            style={{
                                                maxWidth: '100%',
                                                borderRadius: '6px',
                                                margin: '12px 0',
                                                display: 'block',
                                                border: '1px solid var(--rule-light)',
                                            }}
                                        />
                                    );
                                },
                            }}
                        >
                            {note}
                        </ReactMarkdown>
                    ) : (
                        !repoNote && <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>No notes yet. Click Edit to add some.</span>
                    )}
                </div>
            )}
        </div>
    );
}
