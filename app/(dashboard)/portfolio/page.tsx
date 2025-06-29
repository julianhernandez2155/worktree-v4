import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio | Worktree',
  description: 'Showcase your skills and experiences',
};

export default function PortfolioPage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-white mb-4">Portfolio</h1>
      <p className="text-dark-muted">Your portfolio page is coming soon!</p>
    </div>
  );
}