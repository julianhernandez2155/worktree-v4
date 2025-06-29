import { RevolutionaryDiscover } from '@/components/discover/RevolutionaryDiscover';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discover Opportunities | Worktree',
  description: 'Find campus projects that match your skills and interests',
};

export default function Discover() {
  return <RevolutionaryDiscover />;
}