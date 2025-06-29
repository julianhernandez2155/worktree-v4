import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { MyTasksView } from '@/components/tasks/MyTasksView';

interface MyTasksPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MyTasksPage({ params }: MyTasksPageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MyTasksView orgSlug={slug} />
    </Suspense>
  );
}