import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/GlassCard';

export default async function DebugPage() {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // Get profile data
  let profile = null;
  let profileError = null;
  
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    profile = data;
    profileError = error;
  }
  
  // Check if username is populated
  const hasUsername = profile?.username && profile.username.trim() !== '';
  
  // Get expected routes
  const expectedRoutes = {
    profileRedirect: '/dashboard/profile',
    profileEdit: '/dashboard/profile/edit',
    publicProfile: hasUsername ? `/u/${profile.username}` : 'No username set',
    actualUsername: profile?.username || 'NULL',
    email: profile?.email || user?.email || 'No email'
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white mb-8">Profile Debug Information</h1>
      
      {/* User Auth Status */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
          {userError ? (
            <div className="text-red-400">
              <p>Error loading user: {userError.message}</p>
            </div>
          ) : user ? (
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">User ID:</span> {user.id}</p>
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Authenticated:</span> <span className="text-green-400">Yes</span></p>
            </div>
          ) : (
            <p className="text-yellow-400">No user logged in</p>
          )}
        </div>
      </GlassCard>

      {/* Profile Data */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Data</h2>
          {profileError ? (
            <div className="text-red-400">
              <p>Error loading profile: {profileError.message}</p>
              <pre className="mt-2 text-xs">{JSON.stringify(profileError, null, 2)}</pre>
            </div>
          ) : profile ? (
            <div className="space-y-2 text-gray-300">
              <p><span className="text-gray-400">Profile ID:</span> {profile.id}</p>
              <p><span className="text-gray-400">Username:</span> {profile.username || <span className="text-red-400">NOT SET</span>}</p>
              <p><span className="text-gray-400">Full Name:</span> {profile.full_name || <span className="text-yellow-400">Not set</span>}</p>
              <p><span className="text-gray-400">Email in Profile:</span> {profile.email || <span className="text-yellow-400">Not set</span>}</p>
              <p><span className="text-gray-400">Has Username:</span> {hasUsername ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</p>
            </div>
          ) : (
            <p className="text-yellow-400">No profile found</p>
          )}
        </div>
      </GlassCard>

      {/* Expected Routes */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Expected Routes</h2>
          <div className="space-y-2 text-gray-300">
            <p><span className="text-gray-400">Profile Redirect:</span> {expectedRoutes.profileRedirect}</p>
            <p><span className="text-gray-400">Profile Edit:</span> {expectedRoutes.profileEdit}</p>
            <p><span className="text-gray-400">Public Profile:</span> {expectedRoutes.publicProfile}</p>
          </div>
          
          <div className="mt-4 space-y-2">
            <a 
              href={expectedRoutes.profileRedirect}
              className="inline-block px-4 py-2 bg-neon-green text-black rounded-lg hover:bg-neon-green/90"
            >
              Test Profile Redirect
            </a>
            {hasUsername && (
              <a 
                href={expectedRoutes.publicProfile}
                className="inline-block ml-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Test Public Profile
              </a>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Username Generation */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Username Generation</h2>
          <div className="space-y-2 text-gray-300">
            <p><span className="text-gray-400">Email:</span> {expectedRoutes.email}</p>
            <p><span className="text-gray-400">Expected Username (from email):</span> {expectedRoutes.email.split('@')[0]}</p>
            <p><span className="text-gray-400">Actual Username:</span> {expectedRoutes.actualUsername}</p>
          </div>
          
          {!hasUsername && profile && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">
                Username is not set. The migration should have populated it from the email.
                You may need to run the username population migration again.
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Full Profile JSON */}
      <GlassCard>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Full Profile Data (JSON)</h2>
          <pre className="text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      </GlassCard>
    </div>
  );
}