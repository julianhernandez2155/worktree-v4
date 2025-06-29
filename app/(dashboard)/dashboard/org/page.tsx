import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export default async function OrgRedirectPage() {
  const supabase = await createClient();
  
  // Get user's first organization
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: memberData } = await supabase
    .from('organization_members')
    .select(`
      organization:organizations (
        slug
      )
    `)
    .eq('user_id', user.id)
    .limit(1)
    .single();

  // Handle the nested organization data properly
  const organization = memberData?.organization as { slug: string } | undefined;
  
  if (organization?.slug) {
    redirect(`/dashboard/org/${organization.slug}`);
  } else {
    // No organizations - redirect to create one
    redirect('/onboarding-v2');
  }
}