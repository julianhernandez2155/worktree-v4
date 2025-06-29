import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectsView } from '@/components/projects/ProjectsView';

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