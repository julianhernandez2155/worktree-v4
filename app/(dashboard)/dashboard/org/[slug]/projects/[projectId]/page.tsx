import { Suspense } from 'react';

import { ProjectFullPage } from '@/components/projects/ProjectFullPage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProjectDetailPageProps {
  params: Promise<{ slug: string; projectId: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug, projectId } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectFullPage orgSlug={slug} projectId={projectId} />
    </Suspense>
  );
}