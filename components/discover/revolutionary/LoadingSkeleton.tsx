'use client';

import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-dark-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 w-32 bg-dark-card rounded-lg mb-2 animate-pulse" />
          <div className="h-4 w-48 bg-dark-card rounded-lg animate-pulse" />
        </div>

        {/* Filter pills skeleton */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-dark-card rounded-full animate-pulse" />
          ))}
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`
                bg-dark-card rounded-2xl overflow-hidden
                ${i === 1 ? 'md:col-span-2 md:row-span-2' : ''}
                ${i === 3 ? 'md:row-span-2' : ''}
              `}
            >
              <div className="p-6">
                {/* Logo and org */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-dark-bg rounded-xl animate-pulse" />
                  <div className="flex-1">
                    <div className="h-3 w-24 bg-dark-bg rounded mb-1 animate-pulse" />
                    <div className="h-2 w-16 bg-dark-bg rounded animate-pulse" />
                  </div>
                </div>

                {/* Title */}
                <div className="h-4 w-full bg-dark-bg rounded mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-dark-bg rounded mb-4 animate-pulse" />

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="h-3 w-1/2 bg-dark-bg rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-dark-bg rounded animate-pulse" />
                </div>

                {/* Skills */}
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-dark-bg rounded-full animate-pulse" />
                  <div className="h-6 w-20 bg-dark-bg rounded-full animate-pulse" />
                  <div className="h-6 w-14 bg-dark-bg rounded-full animate-pulse" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}