import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Saved Projects | Worktree',
  description: 'Your saved projects and opportunities',
};

export default function SavedProjects() {
  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">Saved Projects</h1>
        <p className="text-gray-400 mb-8">Your bookmarked opportunities will appear here</p>
        
        <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
          <p className="text-gray-500">No saved projects yet</p>
          <p className="text-sm text-gray-600 mt-2">
            Click the bookmark icon on any project to save it for later
          </p>
        </div>
      </div>
    </div>
  );
}