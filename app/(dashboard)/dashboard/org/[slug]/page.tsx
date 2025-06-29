import { Suspense } from 'react';
import { OrgDashboard } from '@/components/org/OrgDashboard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default async function OrganizationDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrgDashboard orgSlug={slug} />
    </Suspense>
  );
}