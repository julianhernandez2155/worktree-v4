'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { NeonButton } from '@/components/ui/NeonButton';
import { DifficultyBadge, DifficultyIndicator } from '@/components/ui/DifficultyBadge';
import { MatchQualityIndicator, MatchScoreDisplay } from '@/components/ui/MatchQualityIndicator';
import { ArrowRight, Sparkles, Code, Users, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-green/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Auth buttons in header */}
        <div className="absolute top-8 right-8 flex gap-4">
          <Link href="/login">
            <NeonButton variant="ghost" size="sm" icon={<LogIn />}>
              Sign in
            </NeonButton>
          </Link>
          <Link href="/signup">
            <NeonButton size="sm">
              Get Started
            </NeonButton>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Worktree</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Bridge campus involvement with career readiness. Find opportunities that match your skills and grow your professional network.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <NeonButton size="lg" icon={<Sparkles />}>
                Get Started
              </NeonButton>
            </Link>
            <NeonButton variant="secondary" size="lg" icon={<ArrowRight />} iconPosition="right">
              Learn More
            </NeonButton>
          </div>
        </div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {/* Glass Card Examples */}
          <GlassCard hover glow="green">
            <h3 className="text-xl font-semibold mb-2">Premium Glass Design</h3>
            <p className="text-gray-400">Beautiful frosted glass effect with smooth animations and hover states.</p>
          </GlassCard>

          <GlassCard variant="surface" hover>
            <h3 className="text-xl font-semibold mb-2">Surface Variant</h3>
            <p className="text-gray-400">Slightly different glass effect for variety in your layouts.</p>
          </GlassCard>

          <GlassCard variant="elevated" hover glow="blue">
            <h3 className="text-xl font-semibold mb-2">Elevated Style</h3>
            <p className="text-gray-400">Higher elevation for important content that needs to stand out.</p>
          </GlassCard>
        </div>

        {/* Difficulty Badges Section */}
        <GlassCard className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Difficulty Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Individual Badges</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                <DifficultyBadge level="beginner" />
                <DifficultyBadge level="intermediate" />
                <DifficultyBadge level="advanced" />
                <DifficultyBadge level="expert" />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Different Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <DifficultyBadge level="intermediate" size="sm" />
                <DifficultyBadge level="intermediate" size="md" />
                <DifficultyBadge level="intermediate" size="lg" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Difficulty Indicators</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24">Beginner:</span>
                  <DifficultyIndicator level="beginner" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24">Intermediate:</span>
                  <DifficultyIndicator level="intermediate" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24">Advanced:</span>
                  <DifficultyIndicator level="advanced" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400 w-24">Expert:</span>
                  <DifficultyIndicator level="expert" />
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Match Quality Section */}
        <GlassCard className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Match Quality Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Badges</h3>
              <div className="flex flex-wrap gap-3 mb-6">
                <MatchQualityIndicator quality="perfect" />
                <MatchQualityIndicator quality="strong" />
                <MatchQualityIndicator quality="good" />
                <MatchQualityIndicator quality="stretch" />
                <MatchQualityIndicator quality="reach" />
              </div>
              
              <h3 className="text-lg font-semibold mb-4">With Scores</h3>
              <div className="flex flex-wrap gap-3">
                <MatchQualityIndicator quality="perfect" score={95} showScore />
                <MatchQualityIndicator quality="strong" score={82} showScore />
                <MatchQualityIndicator quality="good" score={68} showScore />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Match Score Display</h3>
              <div className="flex justify-center">
                <MatchScoreDisplay score={85} quality="strong" showDetails />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Button Showcase */}
        <GlassCard>
          <h2 className="text-2xl font-bold mb-6">Button Variants</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Primary Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <NeonButton size="sm">Small</NeonButton>
                <NeonButton size="md">Medium</NeonButton>
                <NeonButton size="lg">Large</NeonButton>
                <NeonButton loading>Loading</NeonButton>
                <NeonButton disabled>Disabled</NeonButton>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <NeonButton variant="secondary" icon={<Code />}>With Icon</NeonButton>
                <NeonButton variant="secondary" icon={<Users />} iconPosition="right">Icon Right</NeonButton>
                <NeonButton variant="secondary" fullWidth>Full Width</NeonButton>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Other Variants</h3>
              <div className="flex flex-wrap gap-3">
                <NeonButton variant="ghost">Ghost Button</NeonButton>
                <NeonButton variant="danger">Danger Button</NeonButton>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}