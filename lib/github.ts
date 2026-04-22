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
// MOCK DATA (fallback if GitHub fetch fails)
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_TOPICS: Topic[] = [
  { slug: 'useState',            name: 'useState',            category: 'Hooks',             difficulty: 'Beginner',     related: ['useReducer', 'useRef'] },
  { slug: 'useEffect',           name: 'useEffect',           category: 'Hooks',             difficulty: 'Beginner',     related: ['useLayoutEffect', 'useState'] },
  { slug: 'useRef',              name: 'useRef',              category: 'Hooks',             difficulty: 'Intermediate', related: ['useState', 'forwardRef'] },
  { slug: 'useContext',          name: 'useContext',          category: 'State Management',  difficulty: 'Intermediate', related: ['useState', 'useReducer'] },
  { slug: 'useMemo',             name: 'useMemo',             category: 'Performance',       difficulty: 'Intermediate', related: ['useCallback', 'React.memo'] },
  { slug: 'useCallback',         name: 'useCallback',         category: 'Performance',       difficulty: 'Intermediate', related: ['useMemo', 'React.memo'] },
  { slug: 'useReducer',          name: 'useReducer',          category: 'State Management',  difficulty: 'Intermediate', related: ['useState', 'useContext'] },
  { slug: 'custom-hooks',        name: 'Custom Hooks',        category: 'Patterns',          difficulty: 'Intermediate', related: ['useState', 'useEffect'] },
  { slug: 'component-lifecycle', name: 'Component Lifecycle', category: 'Fundamentals',      difficulty: 'Beginner',     related: ['useEffect', 'useState'] },
  { slug: 'props-vs-state',      name: 'Props vs State',      category: 'Fundamentals',      difficulty: 'Beginner',     related: ['useState', 'useContext'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// PARSE README FRONT-MATTER
// Reads lines like "- Category: Hooks" from the top of the README
// ─────────────────────────────────────────────────────────────────────────────
function parseFrontMatter(content: string, slug: string): Topic {
  const lines = content.split('\n');
  const meta: Record<string, string> = {};

  for (const line of lines) {
    const match = line.match(/^-\s+(\w[\w\s]*):\s+(.+)$/);
    if (match) {
      meta[match[1].trim().toLowerCase()] = match[2].trim();
    }
    // Stop at heading — front matter is done
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
    difficulty: (meta['difficulty'] as Topic['difficulty']) ?? 'Beginner',
    related: meta['related']?.split(',').map(s => s.trim()),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH TOPIC LIST
// Lists top-level directories via the GitHub Contents API.
// Falls back to MOCK_TOPICS if the request fails.
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchTopicList(): Promise<Topic[]> {
  try {
    const res = await fetch(API_BASE, {
      next: { revalidate: 3600 },
      headers: { Accept: 'application/vnd.github+json' },
    });

    if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);

    const items: Array<{ name: string; type: string }> = await res.json();
    const folders = items.filter(i => i.type === 'dir' && !i.name.startsWith('.'));

    const topics = await Promise.all(
      folders.map(async (folder): Promise<Topic> => {
        try {
          const readmeRes = await fetch(
            `${RAW_BASE}/${folder.name}/README.md`,
            { next: { revalidate: 3600 } }
          );
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
    console.error('Failed to fetch topic list from GitHub, using mock data:', err);
    return MOCK_TOPICS;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FETCH TOPIC DETAIL
// Fetches the raw README.md for a given topic slug.
// Falls back to mock data on failure.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_CONTENT: Record<string, string> = {
  useState: `- Category: Hooks\n- Difficulty: Beginner\n- Related: useReducer, useRef\n\n\`useState\` is the most fundamental React hook. It adds **reactive state** to a function component.\n\n## Syntax\n\n\`\`\`tsx\nconst [value, setValue] = useState<Type>(initialValue);\n\`\`\`\n\n## Example\n\n\`\`\`tsx\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>;\n}\n\`\`\`\n\n## Common Pitfalls\n\n- State updates are asynchronous\n- Always use functional updates when new state depends on previous\n- Never mutate state directly\n\n## Learn More\n\n- [React Docs — useState](https://react.dev/reference/react/useState)`,
};

export async function fetchTopicDetail(slug: string): Promise<TopicDetail | null> {
  // Always try GitHub first, fall back to mock on error
  try {
    const res = await fetch(`${RAW_BASE}/${slug}/README.md`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const content = await res.text();
      const meta = parseFrontMatter(content, slug);
      return { ...meta, content };
    }
  } catch {
    // fall through to mock
  }

  const mockMeta = MOCK_TOPICS.find(t => t.slug === slug);
  const content =
    MOCK_CONTENT[slug] ??
    `# ${slug}\n\nContent coming soon. Add a README.md to the \`${slug}/\` folder in your react-wiki repo.`;

  if (!mockMeta) return null;
  return { ...mockMeta, content };
}
