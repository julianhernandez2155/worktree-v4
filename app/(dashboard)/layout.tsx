import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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
    <div className="min-h-screen bg-dark-bg">
      {/* Dashboard navigation */}
      <nav className="bg-dark-surface border-b border-dark-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold gradient-text">Worktree</h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-400">Welcome, {profile.first_name || user.email}</span>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}