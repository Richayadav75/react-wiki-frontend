export interface Topic {
  slug: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  related?: string[];
}

export interface TopicDetail extends Topic {
  content: string; // raw Markdown content from README.md
}
