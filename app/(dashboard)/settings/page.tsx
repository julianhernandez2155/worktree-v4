import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Worktree',
  description: 'Manage your account settings',
};

export default function SettingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Settings</h1>
      <p className="text-dark-muted">Your settings page is coming soon!</p>
    </div>
  );
}