"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { fetchTopicDetail } from "@/lib/github";
import TopicCard from "@/components/TopicCard";
import TopicPanel from "@/components/TopicPanel";
import styles from "./Home.module.css";
import { Topic, TopicDetail } from "@/lib/types";

function HomeContent({ initialTopics }: { initialTopics: Topic[] }) {
    const searchParams = useSearchParams();
    const [topicFilter, setTopicFilter] = useState(searchParams.get("topic") || "All Concepts");
    const currentTrack = searchParams.get("track") || "React";
    const [hiddenDiffs, setHiddenDiffs] = useState<Set<string>>(new Set());
    const [selectedTopic, setSelectedTopic] = useState<TopicDetail | Topic | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isPanelOpen) setIsExpanded(false);
    }, [isPanelOpen]);

    useEffect(() => {
        setTopicFilter(searchParams.get("topic") || "All Concepts");
    }, [searchParams]);

    const toggleDiff = (diff: string) => {
        const next = new Set(hiddenDiffs);
        if (next.has(diff)) next.delete(diff);
        else next.add(diff);
        setHiddenDiffs(next);
    };

    const reactCategories = ["Hooks", "State Management", "Fundamentals", "Performance", "Patterns"];
    const jsCategories = ["JavaScript", "Core Concepts of JavaScript", "Interview Questions", "Practice"];

    const filteredByTrack = initialTopics.filter(t => {
        if (currentTrack === "React") {
            return reactCategories.includes(t.category);
        } else {
            return jsCategories.includes(t.category);
        }
    });

    const isAll = topicFilter.startsWith("All ");
    const filteredByTopic = isAll
        ? filteredByTrack
        : filteredByTrack.filter(t => t.category.toLowerCase() === topicFilter.toLowerCase());

    const filtered = filteredByTopic.filter(t => !hiddenDiffs.has(t.difficulty));

    const totalTopics = initialTopics.length;
    // Mock counts since progress tracking is not fully set up in lib/progress.ts yet
    const solvedCount = 0; 
    const inProgressCount = 0;

    useEffect(() => {
        if (selectedTopic && !('content' in selectedTopic)) {
            const loadFullDetails = async () => {
                setFetchError(null);
                try {
                    const full = await fetchTopicDetail(selectedTopic.slug);
                    if (full) {
                        setSelectedTopic(full);
                    } else {
                        setFetchError("Failed to load topic details.");
                    }
                } catch (e) {
                    setFetchError("Error fetching from GitHub.");
                }
            };
            loadFullDetails();
        }
    }, [selectedTopic?.slug]);

    const handleSelect = (t: Topic) => {
        setSelectedTopic(t);
        setIsPanelOpen(true);
    };

    return (
        <div className={`${styles.app} ${isPanelOpen ? styles.panelOpen : ''} ${isExpanded ? styles.focusMode : ''}`}>
            <div className={styles.main}>
                <div style={{
                    paddingBottom: '60px',
                    margin: isPanelOpen && !isExpanded ? '0 32px' : '0 auto',
                    maxWidth: isPanelOpen && !isExpanded ? '100%' : 'var(--col)',
                    transition: 'all 0.35s ease-in-out',
                    opacity: isExpanded ? 0 : 1,
                    pointerEvents: isExpanded ? 'none' : 'auto'
                }}>
                    {/* HERO SECTION */}
                    <section className={styles.hero}>
                        <div className={styles.heroColumns}>
                            <div className={styles.heroLeft}>
                                <span className={styles.kicker}>✦ Live from GitHub</span>
                                <h1 className={styles.heroHeadline}>Master <em>React & JavaScript</em> Concepts, One at a Time</h1>
                                <p className={styles.heroDeck}>
                                    A curated practice journal fetching React & JavaScript concepts directly from{" "}
                                    <a href="https://github.com/Richayadav75/react-wiki" target="_blank" rel="noopener noreferrer">
                                        github.com/Richayadav75/react-wiki
                                    </a>.
                                    Click any topic to read, study, and learn.
                                </p>
                            </div>
                            <div className={styles.colDivider}></div>
                            <div className={styles.heroRight}>
                                <div className={styles.statGrid}>
                                    <div className={styles.statCell}>
                                        <div className={styles.statCellVal}>{totalTopics}</div>
                                        <div className={styles.statCellLbl}>Topics</div>
                                    </div>
                                    <div className={styles.statCell}>
                                        <div className={styles.statCellVal}>{solvedCount}</div>
                                        <div className={styles.statCellLbl}>Read</div>
                                    </div>
                                    <div className={styles.statCell}>
                                        <div className={styles.statCellVal}>{inProgressCount}</div>
                                        <div className={styles.statCellLbl}>In Progress</div>
                                    </div>
                                    <div className={styles.statCell}>
                                        <div className={styles.statCellVal}>TSX</div>
                                        <div className={styles.statCellLbl}>Language</div>
                                    </div>
                                </div>
                                <div className={styles.progressSection}>
                                    <div className={styles.progressLabelRow}>
                                        <span>Progress</span>
                                        <span>{solvedCount} of {totalTopics}</span>
                                    </div>
                                    <div className={styles.progressTrack}>
                                        <div className={styles.progressFill} style={{ width: `${totalTopics === 0 ? 0 : (solvedCount / totalTopics) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* FILTER BAR */}
                    <div className={styles.filterBar}>
                        <span className={styles.filterLabel}>Difficulty</span>
                        <div className={styles.diffTags}>
                            <button
                                className={`${styles.dtag} ${styles.beginner} ${hiddenDiffs.has('Beginner') ? styles.off : ''}`}
                                onClick={() => toggleDiff('Beginner')}
                            >
                                Beginner
                            </button>
                            <button
                                className={`${styles.dtag} ${styles.intermediate} ${hiddenDiffs.has('Intermediate') ? styles.off : ''}`}
                                onClick={() => toggleDiff('Intermediate')}
                            >
                                Intermediate
                            </button>
                            <button
                                className={`${styles.dtag} ${styles.advanced} ${hiddenDiffs.has('Advanced') ? styles.off : ''}`}
                                onClick={() => toggleDiff('Advanced')}
                            >
                                Advanced
                            </button>
                        </div>
                    </div>

                    {/* PROBLEMS TABLE */}
                    <div className={styles.problemsSection}>
                        <div className={styles.sectionRule}>
                            <div className={styles.sectionRuleLine}></div>
                            <div className={styles.sectionRuleLabel}>{topicFilter}</div>
                            <div className={styles.sectionRuleLine}></div>
                        </div>
                        <table className={styles.probTable}>
                            <thead>
                                <tr>
                                    <th style={{ width: '36px' }}>#</th>
                                    <th></th>
                                    <th>Title</th>
                                    <th style={{ textAlign: 'right' }}>Difficulty</th>
                                    <th style={{ width: '20px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '24px 0', color: 'var(--ink3)', fontStyle: 'italic', fontSize: '13px' }}>
                                            No concepts match the current filter.
                                        </td>
                                    </tr>
                                ) : (
                                    filtered.map((topic, i) => (
                                        <TopicCard
                                            key={topic.slug}
                                            topic={topic}
                                            index={i}
                                            isSelected={selectedTopic?.slug === topic.slug}
                                            onSelect={() => handleSelect(topic)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <TopicPanel
                topic={selectedTopic as TopicDetail}
                isOpen={isPanelOpen}
                isExpanded={isExpanded}
                onToggleExpand={() => setIsExpanded(!isExpanded)}
                onClose={() => setIsPanelOpen(false)}
                error={fetchError}
            />
        </div>
    );
}

export default function HomeClient({ topics }: { topics: Topic[] }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <HomeContent initialTopics={topics} />
        </Suspense>
    );
}
