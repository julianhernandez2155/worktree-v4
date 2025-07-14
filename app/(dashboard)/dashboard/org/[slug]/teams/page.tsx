import { TeamsManagement } from '@/components/teams/TeamsManagement';

export default async function TeamsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TeamsManagement orgSlug={slug} />;
}