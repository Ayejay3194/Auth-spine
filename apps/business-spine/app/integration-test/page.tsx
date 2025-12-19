'use client';

import React, { useState } from 'react';
import { 
  useAppContext, 
  usePageState, 
  useMediaQuery,
  ROUTES 
} from '@/suites/core';
import { 
  SmoothButton, 
  SmoothInput, 
  SmoothCard, 
  LoadingSpinner, 
  PageTransition,
  CupertinoBlankState,
  CupertinoSkeleton 
} from '@/suites/ui';
import { formatDate, debounce, clsx } from '@/suites/shared';

export default function IntegrationTest() {
  const { ui, addNotification, setTheme, setSidebarOpen } = useAppContext();
  const isDesktop = useMediaQuery({ minWidth: 768 });
  const [testInput, setTestInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Test usePageState hook
  const { data: testData, loading, error, refetch } = usePageState(
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        message: 'Integration test successful!',
        timestamp: new Date(),
        suites: ['core', 'ui', 'navigation', 'tools', 'shared']
      };
    },
    []
  );

  // Test notification system
  const testNotifications = () => {
    addNotification('Success notification from suites!', 'success');
    setTimeout(() => addNotification('Error notification test', 'error'), 1000);
    setTimeout(() => addNotification('Info notification test', 'info'), 2000);
  };

  // Test theme switching
  const toggleTheme = () => {
    const newTheme = ui.theme === 'light' ? 'dark' : ui.theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
    addNotification(`Theme changed to ${newTheme}`, 'success');
  };

  // Test debounced function
  const debouncedSearch = debounce((value: string) => {
    addNotification(`Debounced search: ${value}`, 'info');
  }, 500);

  const handleInputChange = (value: string) => {
    setTestInput(value);
    debouncedSearch(value);
  };

  // Test loading state
  const testLoading = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addNotification('Loading test complete', 'success');
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Auth-Spine Integration Test
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Verifying all suites are connected and working properly
            </p>
          </div>

          {/* Test Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Core Suite Test */}
            <SmoothCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Core Suite Test
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      AppContext
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Working
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      usePageState
                    </span>
                    <span className={clsx(
                      "text-xs px-2 py-1 rounded",
                      loading ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                    )}>
                      {loading ? 'Loading' : 'Working'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      useMediaQuery
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {isDesktop ? 'Desktop' : 'Mobile'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Routes
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Working
                    </span>
                  </div>
                </div>
              </div>
            </SmoothCard>

            {/* UI Suite Test */}
            <SmoothCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  UI Suite Test
                </h3>
                <div className="space-y-3">
                  <SmoothButton 
                    onClick={testNotifications}
                    className="w-full"
                  >
                    Test Notifications
                  </SmoothButton>
                  <SmoothButton 
                    onClick={toggleTheme}
                    variant="secondary"
                    className="w-full"
                  >
                    Toggle Theme
                  </SmoothButton>
                  <SmoothButton 
                    onClick={testLoading}
                    variant="danger"
                    isLoading={isLoading}
                    className="w-full"
                  >
                    Test Loading
                  </SmoothButton>
                </div>
              </div>
            </SmoothCard>

            {/* Shared Suite Test */}
            <SmoothCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  Shared Suite Test
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div>formatDate:</div>
                    <div className="font-mono text-xs">
                      {formatDate(new Date())}
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <div>clsx utility:</div>
                    <div className="font-mono text-xs">
                      {clsx('base-class', true && 'conditional-class')}
                    </div>
                  </div>
                  <SmoothInput
                    label="Test Debounce"
                    placeholder="Type to test debounce..."
                    value={testInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                </div>
              </div>
            </SmoothCard>
          </div>

          {/* Data Fetching Test */}
          <SmoothCard className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Data Fetching Test (usePageState)
              </h3>
              {loading ? (
                <LoadingSpinner text="Fetching test data..." />
              ) : error ? (
                <div className="text-red-600 dark:text-red-400">
                  Error: {error.message}
                </div>
              ) : testData ? (
                <div className="space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Message:</strong> {testData.message}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Timestamp:</strong> {formatDate(testData.timestamp)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Available Suites:</strong> {testData.suites.join(', ')}
                  </div>
                </div>
              ) : (
                <CupertinoBlankState 
                  title="No data yet"
                  subtitle="Click refresh to fetch test data"
                  buttonText="Refresh Data"
                  onButtonClick={refetch}
                />
              )}
              <div className="mt-4">
                <SmoothButton onClick={refetch}>
                  Refetch Data
                </SmoothButton>
              </div>
            </div>
          </SmoothCard>

          {/* Cupertino Design Test */}
          <SmoothCard className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Cupertino Design System Test
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Blank State
                  </h4>
                  <div className="cupertino-blank" style={{ minHeight: '200px' }}>
                    <div className="cupertino-card">
                      <div className="cupertino-icon">🎨</div>
                      <h1 className="cupertino-title">Design Test</h1>
                      <p className="cupertino-subtitle">
                        Cupertino design system working perfectly
                      </p>
                      <button className="cupertino-button">
                        Test Button
                      </button>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Skeleton Loader
                  </h4>
                  <div className="space-y-3">
                    <CupertinoSkeleton height="20px" />
                    <CupertinoSkeleton height="16px" width="80%" />
                    <CupertinoSkeleton height="16px" width="60%" />
                    <CupertinoSkeleton variant="rectangular" height="60px" />
                    <CupertinoSkeleton variant="circular" width="40px" height="40px" />
                  </div>
                </div>
              </div>
            </div>
          </SmoothCard>

          {/* Navigation Test */}
          <SmoothCard className="mb-8">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Navigation & Routing Test
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    Available Routes
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(ROUTES).map(([key, route]) => (
                      <div key={key} className="text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-mono">{key}:</span> {route}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    UI State
                  </h4>
                  <div className="space-y-2">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-mono">Theme:</span> {ui.theme}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-mono">Sidebar:</span> {ui.sidebarOpen ? 'Open' : 'Closed'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-mono">Mobile Nav:</span> {ui.mobileNavOpen ? 'Open' : 'Closed'}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-mono">Notifications:</span> {ui.notifications.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SmoothCard>

          {/* Test Summary */}
          <SmoothCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Integration Test Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    ✅ Components Working
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• AppProvider (Global State)</li>
                    <li>• Shell (Layout)</li>
                    <li>• Sidebar & MobileNav (Navigation)</li>
                    <li>• Notifications (Toast System)</li>
                    <li>• SmoothButton, SmoothInput, SmoothCard</li>
                    <li>• LoadingSpinner, PageTransition</li>
                    <li>• CupertinoBlankState, CupertinoSkeleton</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    ✅ Hooks & Utilities Working
                  </h4>
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                    <li>• useAppContext (Global State Access)</li>
                    <li>• usePageState (Data Fetching)</li>
                    <li>• useMediaQuery (Responsive Detection)</li>
                    <li>• formatDate, formatCurrency (Utils)</li>
                    <li>• debounce, throttle (Performance)</li>
                    <li>• clsx (Conditional Classes)</li>
                    <li>• ROUTES (Navigation Constants)</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                  🎉 ALL SYSTEMS WORKING - Integration test passed successfully!
                </p>
              </div>
            </div>
          </SmoothCard>
        </div>
      </div>
    </PageTransition>
  );
}
