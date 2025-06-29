import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Applied Projects | Worktree',
  description: 'Track your project applications',
};

export default function AppliedProjects() {
  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Applied Projects</h1>
        <p className="text-gray-400 mb-8">Track the status of your applications</p>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
          <p className="text-gray-500">No applications yet</p>
          <p className="text-sm text-gray-600 mt-2">
            Projects you apply to will appear here with their status
          </p>
        </div>
      </div>
    </div>
  );
}