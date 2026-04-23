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
  { slug: 'closures',           name: 'Closures',            category: 'JavaScript',        difficulty: 'Intermediate', related: ['Scope', 'Hoisting'] },
  { slug: 'prototypes',         name: 'Prototypes',          category: 'JavaScript',        difficulty: 'Advanced',     related: ['Classes', 'Inheritance'] },
  { slug: 'event-loop',         name: 'Event Loop',          category: 'Core Concepts of JavaScript', difficulty: 'Advanced',     related: ['Promises', 'Async/Await'] },
  { slug: 'this-keyword',       name: 'The "this" Keyword',  category: 'Core Concepts of JavaScript', difficulty: 'Intermediate', related: ['Call', 'Apply', 'Bind'] },
  { slug: 'promises',           name: 'Promises',            category: 'JavaScript',        difficulty: 'Intermediate', related: ['Async/Await', 'Callbacks'] },
  { slug: 'hoisting',           name: 'Hoisting',            category: 'Core Concepts of JavaScript', difficulty: 'Beginner',     related: ['Closures', 'Scope'] },
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
  closures: `- Category: JavaScript\n- Difficulty: Intermediate\n- Related: Scope, Hoisting\n\nA **closure** is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).\n\n## How it works\nIn JavaScript, closures are created every time a function is created, at function creation time.\n\n## Example\n\`\`\`javascript\nfunction makeAdder(x) {\n  return function (y) {\n    return x + y;\n  };\n}\n\nconst add5 = makeAdder(5);\nconsole.log(add5(2)); // 7\n\`\`\`\n\n## Why use closures?\n- Data privacy / Encapsulation\n- Function factories\n- Partial application`,
  'event-loop': `- Category: Core Concepts of JavaScript\n- Difficulty: Advanced\n- Related: Promises, Async/Await\n\nThe **Event Loop** is what allows JavaScript to perform non-blocking I/O operations, despite being single-threaded.\n\n## Components\n1. **Call Stack**: Where your code is executed.\n2. **Web APIs**: Browser-provided features (setTimeout, fetch).\n3. **Callback Queue**: Where async callbacks wait.\n4. **Microtask Queue**: Where Promises wait (higher priority).\n\n## Visualization\nImagine a loop that checks the stack: if empty, take the first task from the queue and push it to the stack.`,
  'this-keyword': `- Category: Core Concepts of JavaScript\n- Difficulty: Intermediate\n- Related: Call, Apply, Bind\n\nThe value of \`this\` is determined by how a function is called (runtime binding).\n\n## Binding Rules\n1. **Default**: Window (non-strict) or undefined (strict).\n2. **Implicit**: The object before the dot (\`obj.func()\`).\n3. **Explicit**: Using \`.call()\`, \`.apply()\`, or \`.bind()\Requested.\n4. **New**: The newly created object.\n5. **Arrow Functions**: Inherit \`this\` from the lexical scope.`,
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
      // For demo purposes, we inject practice/interview if not present
      return { 
        ...meta, 
        content,
        practiceCode: `// Practice useState\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}`,
        interviewQuestions: `### 1. What does useState return?\nIt returns an array with two elements: the current state value and a function to update it.\n\n### 2. Can you use useState in class components?\nNo, useState is a hook for functional components. In class components, you use this.state and this.setState.`
      };
    }
  } catch {
    // fall through to mock
  }

  const mockMeta = MOCK_TOPICS.find(t => t.slug === slug);
  const content =
    MOCK_CONTENT[slug] ??
    `# ${slug}\n\nContent coming soon. Add a README.md to the \`${slug}/\` folder in your react-wiki repo.`;

  if (!mockMeta) return null;
  
  // Custom practice/interview data for JS topics
  const jsData: Record<string, { practice: string; interview: string }> = {
    closures: {
      practice: `function createCounter() {\n  let count = 0;\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    getCount: () => count\n  };\n}\n\nconst counter = createCounter();\nconsole.log(counter.increment()); // 1`,
      interview: `### 1. What is a closure?\nA closure is a function that remembers its outer variables and can access them.\n\n### 2. What are the disadvantages of closures?\nThey can lead to memory leaks if not handled properly because variables stay in memory.`
    },
    'event-loop': {
      practice: `console.log("Start");\n\nsetTimeout(() => {\n  console.log("Timeout");\n}, 0);\n\nPromise.resolve().then(() => {\n  console.log("Promise");\n});\n\nconsole.log("End");\n\n// Predict the order of logs!`,
      interview: `### 1. What is the difference between Task and Microtask?\nMicrotasks (Promises) are executed immediately after the current task, before the next event loop tick. Tasks (setTimeout) go to the end of the queue.`
    },
    'this-keyword': {
      practice: `const obj = {\n  name: "Wiki",\n  greet: function() {\n    console.log("Hello, " + this.name);\n  },\n  arrowGreet: () => {\n    console.log("Hello, " + this.name);\n  }\n};\n\nobj.greet(); // Hello, Wiki\nobj.arrowGreet(); // Hello, undefined (in browser)`,
      interview: `### 1. How does 'this' work in arrow functions?\nArrow functions do not have their own 'this'. They inherit it from the parent scope.\n\n### 2. What is the difference between call and apply?\n'call' takes arguments separately, 'apply' takes them as an array.`
    }
  };

  const extra = jsData[slug] || {
    practice: mockMeta.slug === 'useState' ? `function Example() {\n  const [val, setVal] = useState("");\n  return <input value={val} onChange={e => setVal(e.target.value)} />;\n}` : undefined,
    interview: mockMeta.slug === 'useState' ? `1. Why is state immutable?\n2. How do you handle objects in state?` : undefined
  };

  return { 
    ...mockMeta, 
    content,
    practiceCode: extra.practice,
    interviewQuestions: extra.interview
  };
}
