// Backward Compatibility Exports
// Ensures existing imports continue to work during refactoring

// Legacy Action Exports - Redirect to Business Suites
export * as PayrollActions from './business/actions/payroll-actions';

// Legacy Auth Exports - Redirect to Security Suites
export * from './security/authentication/jwt';
export * from './security/authentication/session';

// Legacy Component Exports - Redirect to UI Suites
export { default as Shell } from './ui/components/Shell';
export { default as Notifications } from './ui/components/Notifications';
export { default as SmoothButton } from './ui/components/SmoothButton';
export { default as SmoothInput } from './ui/components/SmoothInput';
export { default as SmoothCard } from './ui/components/SmoothCard';
export { default as LoadingSpinner } from './ui/components/LoadingSpinner';
export { default as PageTransition } from './ui/components/PageTransition';
export { default as CupertinoBlankState } from './ui/components/CupertinoBlankState';
export { default as CupertinoSkeleton } from './ui/components/CupertinoSkeleton';

// Legacy Navigation Exports
export * from './ui/components/navigation';

// Type Exports for Backward Compatibility
export type { JwtClaims } from './security/authentication/jwt';
export type { SmoothButtonProps } from './ui/components/SmoothButton';
export type { SmoothInputProps } from './ui/components/SmoothInput';
export type { SmoothCardProps } from './ui/components/SmoothCard';
export type { LoadingSpinnerProps } from './ui/components/LoadingSpinner';
export type { CupertinoBlankStateProps } from './ui/components/CupertinoBlankState';
export type { CupertinoSkeletonProps } from './ui/components/CupertinoSkeleton';

// Re-export commonly used legacy paths
export { createPayRun, generateItems, moveRunToReview, approvePayRun, rejectPayRun, deletePayRun } from './business/actions/payroll-actions';
export { signToken, verifyToken } from './security/authentication/jwt';
export { newSessionToken, persistSession, revokeSession, verifySession } from './security/authentication/session';
