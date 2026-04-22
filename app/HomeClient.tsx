'use client';

import { useState, useMemo } from 'react';
import { Topic } from '@/lib/types';
import TopicCard from '@/components/TopicCard/TopicCard';
import styles from './HomeClient.module.css';

interface Props {
  topics: Topic[];
}

const ALL = 'All';

export default function HomeClient({ topics }: Props) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [activeDifficulty, setActiveDifficulty] = useState(ALL);

  const categories = useMemo(() => {
    const cats = [...new Set(topics.map(t => t.category))];
    return [ALL, ...cats];
  }, [topics]);

  const filtered = useMemo(() => {
    return topics.filter(t => {
      const matchQ =
        query === '' ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase());
      const matchCat = activeCategory === ALL || t.category === activeCategory;
      const matchDiff = activeDifficulty === ALL || t.difficulty === activeDifficulty;
      return matchQ && matchCat && matchDiff;
    });
  }, [topics, query, activeCategory, activeDifficulty]);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroBadge}>⚛ React Learning Portal</div>
          <h1 className={styles.heroTitle}>
            Master React,<br />
            <span className={styles.heroAccent}>One Concept at a Time</span>
          </h1>
          <p className={styles.heroSub}>
            Concise reference cards for React hooks, patterns, and fundamentals — with
            code examples, pitfall warnings, and links to official docs.
          </p>

          {/* Search */}
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              id="topic-search"
              type="search"
              placeholder="Search topics…"
              className={styles.searchInput}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className={styles.filters}>
        <div className="container">
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              {[ALL, 'Beginner', 'Intermediate', 'Advanced'].map(d => (
                <button
                  key={d}
                  className={`${styles.pill} ${activeDifficulty === d ? styles.pillActive : ''} ${d !== ALL ? styles[`diff${d}`] : ''}`}
                  onClick={() => setActiveDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <p className={styles.count}>
            {filtered.length} topic{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className={styles.grid}>
        <div className="container">
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              <p>No topics match your filters.</p>
              <button className={styles.resetBtn} onClick={() => { setQuery(''); setActiveCategory(ALL); setActiveDifficulty(ALL); }}>
                Reset filters
              </button>
            </div>
          ) : (
            <div className={styles.cards}>
              {filtered.map(topic => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
