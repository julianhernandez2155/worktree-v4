import { TeamsManagement } from '@/components/teams/TeamsManagement';

export default function TeamsPage({ params }: { params: { slug: string } }) {
  return <TeamsManagement orgSlug={params.slug} />;
}