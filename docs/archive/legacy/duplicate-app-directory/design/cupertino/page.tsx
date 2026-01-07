'use client';

import React, { useState } from 'react';
import CupertinoBlankState from '@/src/components/CupertinoBlankState';
import CupertinoSkeleton from '@/src/components/CupertinoSkeleton';

export default function CupertinoDesignSystem() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen">
      {/* Basic Blank State */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Cupertino Blank State
          </h2>
          
          <div className="flex justify-center">
            <CupertinoBlankState
              title="Nothing here yet"
              subtitle="This space will update automatically when there's something to show."
              buttonText="Get Started"
              onButtonClick={handleGetStarted}
            />
          </div>
        </div>
      </section>

      {/* Variants */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Variants & States
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* No Button */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Passive State
              </h3>
              <CupertinoBlankState
                title="No data yet"
                subtitle="Waiting for content to appear."
                showButton={false}
              />
            </div>

            {/* Custom Icon */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Custom Icon
              </h3>
              <CupertinoBlankState
                title="Search complete"
                subtitle="No results found for your query."
                buttonText="Clear filters"
                icon="🔍"
              />
            </div>

            {/* Loading State */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Loading State
              </h3>
              <div className="cupertino-card">
                <div className="cupertino-icon">
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <h1 className="cupertino-title">Loading...</h1>
                <p className="cupertino-subtitle">
                  Please wait while we fetch your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton Loaders */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Skeleton Loaders
          </h2>
          
          <div className="space-y-6">
            {/* Text Skeletons */}
            <div className="cupertino-card p-6">
              <div className="space-y-3">
                <CupertinoSkeleton height="20px" width="60%" />
                <CupertinoSkeleton height="16px" width="100%" />
                <CupertinoSkeleton height="16px" width="80%" />
                <CupertinoSkeleton height="16px" width="90%" />
              </div>
            </div>

            {/* Card Skeleton */}
            <div className="cupertino-card p-6">
              <div className="flex items-start gap-4">
                <CupertinoSkeleton variant="circular" width="44px" height="44px" />
                <div className="flex-1 space-y-3">
                  <CupertinoSkeleton height="20px" width="40%" />
                  <CupertinoSkeleton height="14px" width="100%" />
                  <CupertinoSkeleton height="14px" width="70%" />
                </div>
              </div>
            </div>

            {/* List Skeletons */}
            <div className="cupertino-card p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CupertinoSkeleton variant="circular" width="32px" height="32px" />
                    <div className="flex-1">
                      <CupertinoSkeleton height="16px" width="50%" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design Guidelines */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Design Guidelines
          </h2>
          
          <div className="cupertino-card p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  What Makes It Cupertino
                </h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Frosted glass, not blur soup</li>
                  <li>• Subtle elevation, not screaming shadows</li>
                  <li>• System font stack, correct weights</li>
                  <li>• Gentle motion, not ADHD animations</li>
                  <li>• Neutral emotional tone</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Best Practices
                </h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• Keep copy neutral. No "Oops!" or "Uh-oh!"</li>
                  <li>• Remove button for passive states</li>
                  <li>• Use SF Symbols when native</li>
                  <li>• Don't animate on loop</li>
                  <li>• Respect reduced motion preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Technical Details
                </h3>
                <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                  <li>• backdrop-filter: blur(18px) saturate(180%)</li>
                  <li>• Layered shadows (0 1px 2px, 0 8px 24px)</li>
                  <li>• System font: -apple-system, SF Pro Text</li>
                  <li>• Tight letter-spacing: -0.02em</li>
                  <li>• Blue 007AFF for primary actions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
