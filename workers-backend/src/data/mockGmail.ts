import type { Feedback } from '../types/feedback';

export const mockGmailFeedback: Feedback[] = [
  {
    id: 'gmail-1',
    source: 'gmail',
    content: 'Thank you for the quick response to my support ticket. The issue is now resolved!',
    author: 'customer@example.com',
    timestamp: new Date().toISOString(),
    metadata: {
      subject: 'Re: Support Ticket #1234',
      threadId: 'thread-1234',
    },
  },
  {
    id: 'gmail-2',
    source: 'gmail',
    content: 'I am experiencing slow performance on the dashboard. It takes 10+ seconds to load.',
    author: 'user@company.com',
    timestamp: new Date().toISOString(),
    metadata: {
      subject: 'Performance Issue',
      threadId: 'thread-1235',
    },
  },
  {
    id: 'gmail-3',
    source: 'gmail',
    content: 'The mobile app crashes when I try to upload a large file. Please fix this urgently.',
    author: 'mobile-user@example.com',
    timestamp: new Date().toISOString(),
    metadata: {
      subject: 'Mobile App Crash',
      threadId: 'thread-1236',
    },
  },
  {
    id: 'gmail-4',
    source: 'gmail',
    content: 'Love the new feature updates! The analytics dashboard is exactly what we needed.',
    author: 'happy-customer@example.com',
    timestamp: new Date().toISOString(),
    metadata: {
      subject: 'Feature Feedback',
      threadId: 'thread-1237',
    },
  },
];
