import { Suspense } from 'react';
import { MemberDirectory } from '@/components/members/MemberDirectory';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default async function MembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MemberDirectory orgSlug={slug} />
    </Suspense>
  );
}