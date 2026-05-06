import { Topic, TopicDetail } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
const GITHUB_USER   = 'Richayadav75';
const GITHUB_REPO   = 'react-wiki';
const GITHUB_BRANCH = 'main';

const RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${GITHUB_BRANCH}`;
const API_BASE = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents`;

// ─────────────────────────────────────────────────────────────────────────────
// CURRICULUM ORDER  (serial, line-by-line — not alphabetical)
// ─────────────────────────────────────────────────────────────────────────────

/** Fundamentals / Basic Concepts — programming first principles */
const FUNDAMENTALS_ORDER = [
  'basic-programming',
  'variables',
  'data-types',
  'operators',
  'conditionals',
  'loops',
  'functions',
  'arrays',
  'objects',
  'type corecion',
];

/** React — component model → hooks → optimisation (all lowercase slugs) */
const REACT_ORDER = [
  'component-lifecycle',
  'props-vs-state',
  'usestate',
  'useeffect',
  'useref',
  'usecontext',
  'usereducer',
  'usememo',
  'usecallback',
  'custom-hooks',
  'react-memo',
];

/** JavaScript — core mechanics → OOP → async → browser */
const JS_ORDER = [
  'hoisting & scope',
  'closures',
  'this-keyword',
  'es6-features',
  'array-methods',
  'string-methods',
  'object-methods',
  'math-methods',
  'date-methods',
  'classes-objects',
  'prototypes',
  'map-set',
  'json',
  'promises',
  'async-await',
  'event-loop',
  'error-handling',
  'dom',
  'events',
  'event-delegation',
  'bom',
  'regex',
  'es-modules',
];

/** Returns the position of a slug in its track order (unknown → end) */
function trackIndex(slug: string, category: string): number {
  const order =
    category === 'Fundamentals' ? FUNDAMENTALS_ORDER :
    category === 'React'        ? REACT_ORDER        :
                                  JS_ORDER;
  const idx = order.indexOf(slug);
  return idx === -1 ? 9999 : idx;
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function parseFrontMatter(content: string, slug: string): Topic {
  const lines = content.split('\n');
  const meta: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^-?\s*(\w[\w\s]*):\s*(.+)$/i);
    if (match) {
      meta[match[1].trim().toLowerCase()] = match[2].trim();
    }
    // Stop at first heading so we don't parse content as metadata
    if (line.startsWith('#') && Object.keys(meta).length > 0) break;
  }

  const name = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    slug,
    name:       meta['name']       ?? name,
    category:   meta['category']   ?? 'General',
    track:      meta['track'],
    difficulty: (meta['difficulty'] as Topic['difficulty']) ?? 'Beginner',
    related:    meta['related']?.split(',').map(s => s.trim()),
  };
}

function extractSection(content: string, sectionTitle: string): string | undefined {
  const regex = new RegExp(
    `#{2,3}\\s+(?:\\d+\\.\\s+)?${sectionTitle}\\s*:?\\s*\\n([\\s\\S]*?)(?=\\n#{2,3}|$)`,
    'i'
  );
  const match = content.match(regex);
  if (!match) return undefined;

  const sectionContent = match[1].trim();
  if (['practice', 'example'].includes(sectionTitle.toLowerCase())) {
    const codeMatch = sectionContent.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    if (codeMatch) return codeMatch[1].trim();
  }
  return sectionContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// NORMALISATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Slugs that belong to Fundamentals regardless of README metadata */
const FUNDAMENTALS_SLUGS = new Set([
  'basic-programming', 'variables', 'data-types', 'operators',
  'conditionals', 'loops', 'functions', 'arrays', 'objects',
]);

/** Slugs that belong to React regardless of README metadata (all lowercase) */
const REACT_SLUGS = new Set([
  'component-lifecycle', 'props-vs-state',
  'usestate', 'useeffect', 'useref', 'usecontext', 'usereducer',
  'usememo', 'usecallback', 'custom-hooks', 'react-memo',
]);

/**
 * Maps a topic to one of the three canonical categories:
 *   "Fundamentals" | "React" | "JavaScript"
 *
 * Priority:
 *   1. Slug-based lookup (guaranteed correct)
 *   2. `track` field from README  (author-declared)
 *   3. Default → "JavaScript"
 */
function resolveCategory(t: Topic): 'Fundamentals' | 'React' | 'JavaScript' {
  const slug  = t.slug.toLowerCase();
  const track = (t.track ?? '').toLowerCase().trim();

  // 1. Slug-based — absolute override
  if (FUNDAMENTALS_SLUGS.has(slug)) return 'Fundamentals';
  if (REACT_SLUGS.has(slug))        return 'React';

  // 2. Track field from README
  if (track === 'fundamentals' || track === 'basic concepts') return 'Fundamentals';
  if (track === 'react')                                       return 'React';
  if (track === 'javascript')                                  return 'JavaScript';

  // 3. Default
  return 'JavaScript';
}

// ─────────────────────────────────────────────────────────────────────────────
// API METHODS
// ─────────────────────────────────────────────────────────────────────────────

/** Fetches every folder in the repo and returns a minimal Topic for each. */
export async function fetchTopicList(): Promise<Topic[]> {
  try {
    const res = await fetch(API_BASE, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);

    const items: Array<{ name: string; type: string }> = await res.json();
    const folders = items.filter(i => i.type === 'dir' && !i.name.startsWith('.'));

    return Promise.all(
      folders.map(async (folder): Promise<Topic> => {
        try {
          const r = await fetch(`${RAW_BASE}/${encodeURIComponent(folder.name)}/README.md`);
          if (!r.ok) throw new Error('no readme');
          return parseFrontMatter(await r.text(), folder.name);
        } catch {
          return parseFrontMatter('', folder.name);
        }
      })
    );
  } catch {
    return [];
  }
}

/** Fetches the full Markdown content + extracted sections for one topic. */
export async function fetchTopicDetail(slug: string): Promise<TopicDetail | null> {
  try {
    const r = await fetch(`${RAW_BASE}/${encodeURIComponent(slug)}/README.md`);
    if (!r.ok) return null;

    const raw = await r.text();

    // Rewrite relative image paths → absolute raw GitHub URLs
    // e.g. ![Concept](concept.png) → ![Concept](https://raw.githubusercontent.com/.../slug/concept.png)
    const content = raw.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      (_, alt, src) => {
        const encodedSlug = encodeURIComponent(slug);
        const cleanSrc = src.replace(/^\.\//, '');
        const encodedSrc = cleanSrc.split('/').map(encodeURIComponent).join('/');
        return `![${alt}](${RAW_BASE}/${encodedSlug}/${encodedSrc})`;
      }
    );

    const meta = parseFrontMatter(content, slug);

    // Strip metadata from the top of content so it doesn't render in the UI
    const lines = content.split('\n');
    const cleanLines = [];
    let inMeta = true;
    for (const line of lines) {
      if (inMeta) {
        // Skip lines that are metadata or empty lines between/before metadata
        if (line.match(/^-?\s*(\w[\w\s]*):\s*(.+)$/i) || line.trim() === '') {
          continue;
        }
        inMeta = false; // Stop stripping once we hit real content (headings, text, etc)
      }
      cleanLines.push(line);
    }
    const cleanContent = cleanLines.join('\n');

    let interviewContent: string | undefined;
    try {
      const ir = await fetch(`${RAW_BASE}/${encodeURIComponent(slug)}/interview.md`);
      if (ir.ok) interviewContent = await ir.text();
    } catch { /* interview.md is optional */ }

    return {
      ...meta,
      content: cleanContent,
      interviewContent,
      practiceCode:       extractSection(cleanContent, 'Practice') || extractSection(cleanContent, 'Example'),
      interviewQuestions: extractSection(cleanContent, 'Interview Questions'),
    };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PROCESSED TOPIC LIST  (normalised + sorted)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns all topics normalised into exactly three categories
 * and sorted in curriculum / serial order (not alphabetically).
 */
export async function getProcessedTopics(): Promise<Topic[]> {
  const list = await fetchTopicList();

  // 1. Normalise category to one of the three canonical values
  const normalised = list.map(t => ({
    ...t,
    category: resolveCategory(t),
  }));

  // 2. Sort by curriculum position within each category, unknowns go last
  return normalised.sort((a, b) => {
    // Keep topics within the same category grouped
    if (a.category !== b.category) {
      const catOrder = ['Fundamentals', 'React', 'JavaScript'];
      return catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
    }
    return trackIndex(a.slug, a.category) - trackIndex(b.slug, b.category);
  });
}
