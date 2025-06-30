import { Suspense } from 'react';

import { ProjectsHub } from '@/components/projects/ProjectsHub';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface ProjectsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { slug } = await params;

  return (
    <div className="h-[calc(100vh-12rem)]">
      <Suspense fallback={<LoadingSpinner />}>
        <ProjectsHub orgSlug={slug} />
      </Suspense>
    </div>
  );
}