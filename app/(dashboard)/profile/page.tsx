import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Worktree',
  description: 'Manage your profile',
};

export default function ProfilePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Profile</h1>
      <p className="text-dark-muted">Your profile page is coming soon!</p>
    </div>
  );
}