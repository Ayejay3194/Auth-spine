// UI Suite - UI components, design systems, and visual polish
// Organized for clean imports and reduced circular dependencies

// Component Exports
export * from './components';

// Styles (CSS imports)
import './styles/animations.css';
import './styles/cupertino.css';

// Types
export interface SmoothButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export interface SmoothInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export interface SmoothCardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  onClick?: () => void;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface CupertinoBlankStateProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  showButton?: boolean;
}

export interface CupertinoSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}
