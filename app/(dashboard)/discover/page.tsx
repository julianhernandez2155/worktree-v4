import { Metadata } from 'next';

import { ForYouPage } from '@/components/discover/ForYouPage';

export const metadata: Metadata = {
  title: 'Discover Opportunities | Worktree',
  description: 'Find campus projects that match your skills and interests',
};

export default function Discover() {
  return <ForYouPage />;
}