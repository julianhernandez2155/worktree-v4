import { Suspense } from 'react';
import { OrgLayout } from '@/components/org/OrgLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrgLayout>{children}</OrgLayout>
    </Suspense>
  );
}