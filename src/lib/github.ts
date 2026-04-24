import { Topic, TopicDetail } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const GITHUB_USER = 'Richayadav75';
const GITHUB_REPO = 'react-wiki';
const GITHUB_BRANCH = 'main';

const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function parseFrontMatter(content: string, slug: string): Topic {
  const lines = content.split('\n');
  const meta: Record<string, string> = {};

  for (const line of lines) {
    // Flexible regex: handles optional dash, optional spaces, and case-insensitive keys
    const match = line.match(/^-?\s*(\w[\w\s]*):\s*(.+)$/i);
    if (match) {
      meta[match[1].trim().toLowerCase()] = match[2].trim();
    }
    if (line.startsWith('#') && Object.keys(meta).length > 0) break;
  }

  const name = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    slug,
    name: meta['name'] ?? name,
    category: meta['category'] ?? 'General',
    track: meta['track'],
    difficulty: (meta['difficulty'] as Topic['difficulty']) ?? 'Beginner',
    related: meta['related']?.split(',').map(s => s.trim()),
  };
}

function extractSection(content: string, sectionTitle: string): string | undefined {
  // More robust regex: 
  // 1. Supports ## or ###
  // 2. Supports optional numbering (e.g., "1. ")
  // 3. Supports optional colon (e.g., "Example:")
  // 4. Case-insensitive
  const regex = new RegExp(`#{2,3}\\s+(?:\\d+\\.\\s+)?${sectionTitle}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n#{2,3}|$)`, 'i');
  const match = content.match(regex);
  if (!match) return undefined;

  let sectionContent = match[1].trim();
  if (sectionTitle.toLowerCase() === 'practice' || sectionTitle.toLowerCase() === 'example') {
    const codeBlockMatch = sectionContent.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) return codeBlockMatch[1].trim();
  }
  return sectionContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// API METHODS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetches the list of all topics by scanning the repository folders.
 */
export async function fetchTopicList(): Promise<Topic[]> {
  try {
    const res = await fetch(API_BASE, {
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

    const items: Array<{ name: string; type: string }> = await res.json();
    const folders = items.filter(i => i.type === 'dir' && !i.name.startsWith('.'));

    const topics = await Promise.all(
      folders.map(async (folder): Promise<Topic> => {
        try {
          const readmeRes = await fetch(`${RAW_BASE}/${folder.name}/README.md`);
          if (!readmeRes.ok) throw new Error('no readme');
          const content = await readmeRes.text();
          return parseFrontMatter(content, folder.name);
        } catch {
          return parseFrontMatter('', folder.name);
        }
      })
    );

    return topics;
  } catch (err) {
    return [];
  }
}

/**
 * Fetches the full content of a specific topic from its README.md file.
 */
export async function fetchTopicDetail(slug: string): Promise<TopicDetail | null> {
  try {
    const readmeRes = await fetch(`${RAW_BASE}/${slug}/README.md`);
    if (readmeRes.ok) {
      const content = await readmeRes.text();
      const meta = parseFrontMatter(content, slug);
      
      // Attempt to fetch interview.md if it exists
      let interviewContent: string | undefined;
      try {
        const interviewRes = await fetch(`${RAW_BASE}/${slug}/interview.md`);
        if (interviewRes.ok) {
          interviewContent = await interviewRes.text();
        }
      } catch {}

      return {
        ...meta,
        content,
        interviewContent,
        practiceCode: extractSection(content, "Practice") || extractSection(content, "Example"),
        interviewQuestions: extractSection(content, "Interview Questions")
      };
    }
  } catch {}

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA PROCESSING (Normalization & Sorting)
// ─────────────────────────────────────────────────────────────────────────────

const FUNDAMENTALS_CATS = ["Programming Basics", "Fundamentals", "Basic", "Basic Fundamentals"];
const REACT_CATS = ["Hooks", "State Management", "Performance", "Patterns", "React", "React Fundamentals"];

const FOUNDATIONAL_SLUGS = [
  'intro-programming', 'variables', 'operators', 'data-types',
  'conditionals', 'loops', 'functions', 'arrays', 'objects'
];

const JS_ORDER = [
  'closures', 'hoisting', 'scope', 'this-keyword', 'event-loop',
  'promises', 'async-await', 'es6-features', 'array-methods',
  'string-methods', 'object-methods', 'math-methods', 'date-methods',
  'classes-objects', 'prototypes', 'map-set', 'json', 'dom', 'bom',
  'events', 'error-handling', 'regex'
];

/**
 * Normalizes a list of topics into the 3 primary categories and sorts them.
 */
export async function getProcessedTopics(): Promise<Topic[]> {
  const list = await fetchTopicList();

  // 1. Normalize categories
  const normalized = list.map(t => {
    const cat = t.category;
    const track = t.track?.toLowerCase();
    const slug = t.slug.toLowerCase();

    let finalCategory = "JavaScript"; // Default

    const isReact = slug.includes('react') || slug.includes('hook') || slug === 'component-lifecycle' || slug === 'props-vs-state';

    if (!isReact && (FOUNDATIONAL_SLUGS.includes(slug) || track === "fundamentals" || track === "basic" || track === "programming" || FUNDAMENTALS_CATS.some(c => cat.includes(c)))) {
      finalCategory = "Basic Concepts";
    } else if (isReact || track === "react" || REACT_CATS.some(c => cat.includes(c))) {
      finalCategory = "React";
    }

    return { ...t, category: finalCategory };
  });

  // 2. Sort based on custom curriculum order
  return normalized.sort((a, b) => {
    const indexA = JS_ORDER.indexOf(a.slug);
    const indexB = JS_ORDER.indexOf(b.slug);

    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });
}
