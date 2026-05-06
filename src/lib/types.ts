export interface Topic {
  slug: string;
  name: string;
  category: string;
  track?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  related?: string[];
}

export interface TopicDetail extends Topic {
  content: string; // raw Markdown content from README.md
  practiceCode?: string;
  interviewQuestions?: string;
  interviewContent?: string; // Content from interview.md
  flowContent?: string;
  noteContent?: string;
}

