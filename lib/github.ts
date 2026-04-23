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
  { slug: 'async-await',        name: 'Async/Await',         category: 'JavaScript',        difficulty: 'Intermediate', related: ['Promises', 'Event Loop'] },
  { slug: 'es6-features',       name: 'ES6+ Features',       category: 'JavaScript',        difficulty: 'Beginner',     related: ['Arrow Functions', 'Destructuring'] },
  { slug: 'array-methods',      name: 'Array Methods',       category: 'JavaScript',        difficulty: 'Beginner',     related: ['ES6 Features'] },
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

function extractSection(content: string, sectionTitle: string): string | undefined {
  const regex = new RegExp(`##\\s+${sectionTitle}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i');
  const match = content.match(regex);
  if (!match) return undefined;
  
  let sectionContent = match[1].trim();
  
  // If it's the Practice section, try to extract just the code from a code block
  if (sectionTitle.toLowerCase() === 'practice' || sectionTitle.toLowerCase() === 'example') {
    const codeBlockMatch = sectionContent.match(/```(?:\w+)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) return codeBlockMatch[1].trim();
  }
  
  return sectionContent;
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

    // Merge with MOCK_TOPICS to ensure all topics (including local/new ones) are visible
    const combined = [...topics];
    for (const mock of MOCK_TOPICS) {
      if (!combined.some(t => t.slug === mock.slug)) {
        combined.push(mock);
      }
    }

    return combined;
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
  useEffect: `- Category: Hooks\n- Difficulty: Beginner\n- Related: useLayoutEffect, useState\n\n\`useEffect\` lets you synchronize a component with an external system.`,
  useRef: `- Category: Hooks\n- Difficulty: Intermediate\n- Related: useState, forwardRef\n\n\`useRef\` is a React Hook that lets you reference a value that’s not needed for rendering.`,
  useContext: `- Category: State Management\n- Difficulty: Intermediate\n- Related: useState, useReducer\n\n\`useContext\` is a React Hook that lets you read and subscribe to context from your component.`,
  useMemo: `- Category: Performance\n- Difficulty: Intermediate\n- Related: useCallback, React.memo\n\n\`useMemo\` is a React Hook that lets you cache the result of a calculation between re-renders.`,
  useCallback: `- Category: Performance\n- Difficulty: Intermediate\n- Related: useMemo, React.memo\n\n\`useCallback\` is a React Hook that lets you cache a function definition between re-renders.`,
  useReducer: `- Category: State Management\n- Difficulty: Intermediate\n- Related: useState, useContext\n\n\`useReducer\` is a React Hook that lets you add a reducer to your component.`,
  'custom-hooks': `- Category: Patterns\n- Difficulty: Intermediate\n- Related: useState, useEffect\n\nCustom Hooks are functions that start with "use" and can call other Hooks.`,
  'component-lifecycle': `- Category: Fundamentals\n- Difficulty: Beginner\n- Related: useEffect, useState\n\nUnderstanding how components mount, update, and unmount.`,
  'props-vs-state': `- Category: Fundamentals\n- Difficulty: Beginner\n- Related: useState, useContext\n\nProps are read-only and passed from parent to child. State is managed within the component.`,
  closures: `- Category: JavaScript\n- Difficulty: Intermediate\n- Related: Scope, Hoisting\n\nA **closure** is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment).\n\n## How it works\nIn JavaScript, closures are created every time a function is created, at function creation time.\n\n## Example\n\`\`\`javascript\nfunction makeAdder(x) {\n  return function (y) {\n    return x + y;\n  };\n}\n\nconst add5 = makeAdder(5);\nconsole.log(add5(2)); // 7\n\`\`\`\n\n## Why use closures?\n- Data privacy / Encapsulation\n- Function factories\n- Partial application`,
  'event-loop': `- Category: Core Concepts of JavaScript\n- Difficulty: Advanced\n- Related: Promises, Async/Await\n\nThe **Event Loop** is what allows JavaScript to perform non-blocking I/O operations, despite being single-threaded.\n\n## Components\n1. **Call Stack**: Where your code is executed.\n2. **Web APIs**: Browser-provided features (setTimeout, fetch).\n3. **Callback Queue**: Where async callbacks wait.\n4. **Microtask Queue**: Where Promises wait (higher priority).\n\n## Visualization\nImagine a loop that checks the stack: if empty, take the first task from the queue and push it to the stack.`,
  'this-keyword': `- Category: Core Concepts of JavaScript\n- Difficulty: Intermediate\n- Related: Call, Apply, Bind\n\nThe value of \`this\` is determined by how a function is called (runtime binding).\n\n## Binding Rules\n1. **Default**: Window (non-strict) or undefined (strict).\n2. **Implicit**: The object before the dot (\`obj.func()\`).\n3. **Explicit**: Using \`.call()\`, \`.apply()\`, or \`.bind()\Requested.\n4. **New**: The newly created object.\n5. **Arrow Functions**: Inherit \`this\` from the lexical scope.`,
  promises: `- Category: JavaScript\n- Difficulty: Intermediate\n- Related: Async/Await, Callbacks\n\nPromises are used to handle asynchronous operations. They provide a more robust way to handle success/failure than callbacks.\n\n## States\n- Pending\n- Fulfilled\n- Rejected`,
  hoisting: `- Category: Core Concepts of JavaScript\n- Difficulty: Beginner\n- Related: Closures, Scope\n\nHoisting is JavaScript's default behavior of moving declarations to the top of the current scope.`,
  'async-await': `- Category: JavaScript\n- Difficulty: Intermediate\n- Related: Promises, Event Loop\n\nAsync/Await is built on top of promises and makes async code cleaner.`,
  'es6-features': `- Category: JavaScript\n- Difficulty: Beginner\n- Related: Arrow Functions, Destructuring\n\nModern JavaScript features like Arrow functions, Destructuring, and Spread/Rest.`,
  'array-methods': `- Category: JavaScript\n- Difficulty: Beginner\n- Related: ES6 Features\n\nMethods like .map(), .filter(), and .reduce() for array manipulation.`,
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
      
      // Extract specific sections if they exist in the markdown
      const interviewQuestions = extractSection(content, "Interview Questions");
      const practiceCode = extractSection(content, "Practice") || extractSection(content, "Example");
      
      return { 
        ...meta, 
        content,
        practiceCode,
        interviewQuestions
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

  const reactData: Record<string, { practice: string; interview: string }> = {
    useEffect: {
      practice: `useEffect(() => {\n  const timer = setInterval(() => console.log("Tick"), 1000);\n  return () => clearInterval(timer); // Cleanup is crucial!\n}, []);`,
      interview: `1. When does useEffect run?\n2. What is the dependency array?`
    },
    useRef: {
      practice: `function FocusInput() {\n  const inputRef = useRef(null);\n  const handleClick = () => inputRef.current.focus();\n  return <><input ref={inputRef} /><button onClick={handleClick}>Focus</button></>;\n}`,
      interview: `1. Does changing a ref cause a re-render?\n2. What can you store in a ref?`
    },
    useContext: {
      practice: `const ThemeContext = createContext("light");\nfunction App() {\n  return (\n    <ThemeContext.Provider value="dark">\n      <ThemedButton />\n    </ThemeContext.Provider>\n  );\n}\nfunction ThemedButton() {\n  const theme = useContext(ThemeContext);\n  return <button className={theme}>I am {theme}!</button>;\n}`,
      interview: `1. How to avoid unnecessary re-renders with context?\n2. When should you use context vs props?`
    },
    useMemo: {
      practice: `const expensiveValue = useMemo(() => {\n  return computeExpensiveValue(a, b);\n}, [a, b]);`,
      interview: `1. When is useMemo worth the overhead?\n2. What happens if you omit the dependencies?`
    },
    useCallback: {
      practice: `const memoizedCallback = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);`,
      interview: `1. Difference between useMemo and useCallback?`
    },
    useReducer: {
      practice: `function reducer(state, action) {\n  switch (action.type) {\n    case "increment": return { count: state.count + 1 };\n    default: throw new Error();\n  }\n}\nconst [state, dispatch] = useReducer(reducer, { count: 0 });`,
      interview: `1. When to use useReducer over useState?`
    }
  };

  const extra = jsData[slug] || reactData[slug] || {
    practice: mockMeta.slug === 'useState' ? `function Example() {\n  const [val, setVal] = useState("");\n  return <input value={val} onChange={e => setVal(e.target.value)} />;\n}` : undefined,
    interview: mockMeta.slug === 'useState' ? `### 1. Why is state immutable?\nState should be treated as read-only. Mutating it directly won't trigger a re-render.\n\n### 2. How do you handle objects in state?\nYou should copy the existing object and update the property: \`setObj({ ...obj, prop: value })\`.` : undefined
  };

  return { 
    ...mockMeta, 
    content,
    practiceCode: extra.practice,
    interviewQuestions: extra.interview
  };
}
