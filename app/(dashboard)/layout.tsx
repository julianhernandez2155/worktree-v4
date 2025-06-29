import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PersistentLayout } from '@/components/navigation/PersistentLayout';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // If user doesn't have a profile, redirect to onboarding
  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <PersistentLayout>
      {children}
    </PersistentLayout>
  );
}