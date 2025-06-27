'use client';

import { AuthForm } from '@/components/auth/AuthForm';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-dark-bg relative overflow-hidden flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-green/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-neon-coral/10 rounded-full blur-3xl" />
      </div>

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to home
      </Link>

      <div className="relative z-10 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text">Join Worktree</h1>
          <p className="text-gray-400 text-lg">Bridge campus involvement with career readiness</p>
        </div>
        
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}