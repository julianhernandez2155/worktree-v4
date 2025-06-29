import { Suspense } from 'react';

import { ProjectsView } from '@/components/projects/ProjectsView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProjectsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectsView orgSlug={slug} />
    </Suspense>
  );
}