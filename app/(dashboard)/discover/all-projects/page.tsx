import { Metadata } from 'next';

import { AllProjectsPage } from '@/components/discover/AllProjectsPage';

export const metadata: Metadata = {
  title: 'All Projects | Worktree',
  description: 'Browse all available campus projects and opportunities',
};

export default function AllProjects() {
  return <AllProjectsPage />;
}