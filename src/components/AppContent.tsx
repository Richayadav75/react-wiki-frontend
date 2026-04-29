import { useWiki } from "@/hooks/useWiki";
import { useProgress } from "@/hooks/useProgress";
import { useWikiUI } from "@/hooks/useWikiUI";
import TopicCard from "@/components/TopicCard";
import TopicPanel from "@/components/TopicPanel";
import Navbar from "@/components/Navbar";
import StatCell from "@/components/StatCell";
import EmptyState from "@/components/EmptyState";
import { TopicDetail } from "@/lib/types";

/**
 * Main Application Shell Logic and Layout
 * Clean, readable, and highly modular.
 */
export default function AppContent() {
  // Logic Hooks
  const {
    topics, filtered, isLoading, fetchError,
    topicFilter, currentTrack, hiddenDiffs, toggleDiff,
    selectedTopic, setSelectedTopic
  } = useWiki();

  const { solvedSlugs, markAsRead, toggleRead } = useProgress();

  // UI State Hook
  const {
    isPanelOpen, isExpanded, handleSelect, closePanel, toggleExpand
  } = useWikiUI(markAsRead, selectedTopic, setSelectedTopic);

  // Derived Data
  const solvedCount = topics.filter(t => solvedSlugs.has(t.slug)).length;
  const progressPercent = topics.length === 0 ? 0 : (solvedCount / topics.length) * 100;

  if (isLoading) return <div className="wiki-app__loading-overlay">Loading Curriculum...</div>;

  return (
    <>
      <Navbar />
      <main className={`wiki-app ${isPanelOpen ? 'wiki-app--panel-open' : ''} ${isExpanded ? 'wiki-app--focus-mode' : ''}`}>
        <div className="wiki-app__main">
          <div className="wiki-app__content-wrapper" style={{
            margin: isPanelOpen && !isExpanded ? '0 32px' : '0 auto',
            maxWidth: isPanelOpen && !isExpanded ? '100%' : 'var(--col)',
          }}>

            {/* HERO: Stats & Welcome */}
            <section className="wiki-app__hero">
              <div className="wiki-app__hero-columns">
                <div className="wiki-app__hero-left">
                  <span className="wiki-app__hero-kicker">✦ Live from GitHub</span>
                  <h1 className="wiki-app__hero-headline">Master <em>React & JavaScript</em> Concepts</h1>
                  <p className="wiki-app__hero-deck">A curated practice journal fetching concepts directly from GitHub.</p>
                </div>

                <div className="wiki-app__col-divider" />

                <div className="wiki-app__hero-right">
                  <div className="wiki-app__stat-grid">
                    <StatCell val={topics.length} label="Topics" />
                    <StatCell val={solvedCount} label="Read" />
                    <StatCell val={topics.length - solvedCount} label="In Progress" />
                    <StatCell val="TSX" label="Language" />
                  </div>

                  <div className="wiki-app__progress-section">
                    <div className="wiki-app__progress-label-row">
                      <span>Progress</span>
                      <span>{solvedCount} of {topics.length}</span>
                    </div>
                    <div className="wiki-app__progress-track">
                      <div className="wiki-app__progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FILTERS */}
            <div className="wiki-app__filter-bar">
              <span className="wiki-app__filter-label">Difficulty</span>
              <div className="wiki-app__diff-tags">
                {['Beginner', 'Intermediate', 'Advanced'].map(diff => (
                  <button
                    key={diff}
                    className={`wiki-app__dtag wiki-app__dtag--${diff.toLowerCase()} ${hiddenDiffs.has(diff) ? 'wiki-app__dtag--off' : ''}`}
                    onClick={() => toggleDiff(diff)}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* LISTING */}
            <div className="wiki-app__problems-section">
              <div className="wiki-app__section-rule">
                <div className="wiki-app__section-rule-line" />
                <div className="wiki-app__section-rule-label">{topicFilter}</div>
                <div className="wiki-app__section-rule-line" />
              </div>

              <table className="wiki-app__prob-table">
                <thead>
                  <tr>
                    <th style={{ width: '36px' }}>#</th>
                    <th />
                    <th>Title</th>
                    <th style={{ textAlign: 'right' }}>Difficulty</th>
                    <th style={{ width: '20px' }} />
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? <EmptyState /> : (
                    filtered.map((topic, i) => (
                      <TopicCard
                        key={topic.slug}
                        topic={topic}
                        index={i}
                        isSelected={selectedTopic?.slug === topic.slug}
                        isRead={solvedSlugs.has(topic.slug)}
                        onSelect={() => handleSelect(topic)}
                        onToggleRead={(e) => {
                          e.stopPropagation();
                          toggleRead(topic.slug);
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* DETAIL PANEL */}
        <TopicPanel
          topic={selectedTopic as TopicDetail}
          isOpen={isPanelOpen}
          isExpanded={isExpanded}
          onToggleExpand={toggleExpand}
          onClose={closePanel}
          error={fetchError}
        />
      </main>
    </>
  );
}
