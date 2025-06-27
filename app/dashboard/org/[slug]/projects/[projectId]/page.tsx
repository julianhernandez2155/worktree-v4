import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProjectDetail } from '@/components/projects/ProjectDetail';

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