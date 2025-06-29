import { Suspense } from 'react';

import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string; projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug, projectId } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectDetail orgSlug={slug} projectId={projectId} />
    </Suspense>
  );
}