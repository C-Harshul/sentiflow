import type { Feedback } from '../types/feedback';

export const mockGithubFeedback: Feedback[] = [
  {
    id: 'github-1',
    source: 'github',
    content: 'The new authentication system is great! Much faster than before.',
    author: 'user123',
    timestamp: new Date().toISOString(),
    metadata: {
      repo: 'signalflow/app',
      issueNumber: 42,
      labels: ['enhancement', 'authentication'],
    },
  },
  {
    id: 'github-2',
    source: 'github',
    content: 'I encountered a bug when trying to export data. The CSV file is corrupted.',
    author: 'developer456',
    timestamp: new Date().toISOString(),
    metadata: {
      repo: 'signalflow/app',
      issueNumber: 43,
      labels: ['bug', 'export'],
    },
  },
  {
    id: 'github-3',
    source: 'github',
    content: 'Would love to see dark mode support. The current theme is too bright.',
    author: 'designer789',
    timestamp: new Date().toISOString(),
    metadata: {
      repo: 'signalflow/app',
      issueNumber: 44,
      labels: ['feature-request', 'ui'],
    },
  },
  {
    id: 'github-4',
    source: 'github',
    content: 'The API documentation is unclear. Need better examples for webhook integration.',
    author: 'api-user',
    timestamp: new Date().toISOString(),
    metadata: {
      repo: 'signalflow/docs',
      issueNumber: 15,
      labels: ['documentation', 'api'],
    },
  },
];
