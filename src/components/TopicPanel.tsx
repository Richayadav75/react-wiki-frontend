import { useState, useEffect } from "react";
import { TopicDetail } from "@/lib/types";
import CodeViewer from "@/components/CodeViewer";
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

export default function TopicPanel({ topic, isOpen, isExpanded, onToggleExpand, onClose, error }: TopicPanelProps) {
    const [activeTab, setActiveTab] = useState<'concept' | 'practice' | 'interview' | 'notes'>('concept');

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

                {/* NOTES TAB */}
                {activeTab === 'notes' && (
                    <NotesTab slug={topic.slug} />
                )}
            </div>
        </aside>
    );
}

function NotesTab({ slug }: { slug: string }) {
    const [note, setNote] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const savedNotes = localStorage.getItem(`wiki_notes_${slug}`);
        if (savedNotes) {
            setNote(savedNotes);
        } else {
            setNote("");
            setIsEditing(true); // Open edit mode by default if no note
        }
    }, [slug]);

    const handleSave = () => {
        localStorage.setItem(`wiki_notes_${slug}`, note);
        setIsEditing(false);
    };

    return (
        <div id="tab-notes">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className={styles.colKicker} style={{ margin: 0 }}>Your notes (Supports Markdown)</span>
                {note && !isEditing && (
                    <button className={styles.notesSave} onClick={() => setIsEditing(true)}>Edit</button>
                )}
            </div>
            
            {isEditing ? (
                <>
                    <textarea 
                        className={styles.notesArea} 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Your mental model, gotchas, code snippets... You can also add images using Markdown: ![alt text](image_url)"
                    ></textarea>
                    <button className={styles.notesSave} onClick={handleSave}>Save Notes</button>
                </>
            ) : (
                <div className={styles.panelBodyText} style={{ minHeight: '200px', border: '1px solid var(--rule-light)', padding: '16px', borderRadius: '4px' }}>
                    {note ? (
                        <ReactMarkdown>{note}</ReactMarkdown>
                    ) : (
                        <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>No notes yet. Click Edit to add some.</span>
                    )}
                </div>
            )}
        </div>
    );
}
