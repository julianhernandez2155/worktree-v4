import { Suspense } from 'react';

import { RoleHealthDashboard } from '@/components/roles/RoleHealthDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default async function RolesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RoleHealthDashboard orgSlug={slug} />
    </Suspense>
  );
}