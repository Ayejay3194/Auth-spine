/**
 * Atomic Components - Smallest UI Units
 * 
 * These are the building blocks that cannot be broken down further.
 * All components must use these atoms consistently.
 */

import React from 'react';

// Avatar Atom
interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  fallback
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`
        relative inline-flex items-center justify-center
        rounded-full bg-gray-200 text-gray-600 font-medium
        overflow-hidden
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement!.textContent = fallback || initials;
          }}
        />
      ) : (
        <span>{fallback || initials}</span>
      )}
    </div>
  );
};

// Button Atom
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  icon,
  iconPosition = 'left'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400'
  };
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${loading ? 'opacity-50' : ''}
        ${className}
      `}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  );
};

// Text Atom
interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'label';
  color?: 'primary' | 'secondary' | 'muted' | 'danger' | 'success';
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  className = '',
  as: Component = 'span'
}) => {
  const variantClasses = {
    h1: 'text-3xl font-bold leading-tight',
    h2: 'text-2xl font-bold leading-tight',
    h3: 'text-xl font-semibold leading-tight',
    h4: 'text-lg font-medium leading-tight',
    body: 'text-sm leading-normal',
    caption: 'text-xs leading-normal',
    label: 'text-sm font-medium leading-normal'
  };
  
  const colorClasses = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
    danger: 'text-red-600',
    success: 'text-green-600'
  };
  
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${colorClasses[color]}
        ${weightClasses[weight]}
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

// Icon Atom
interface IconProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 'md',
  color = 'currentColor',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // Simple icon mapping - in a real app, use an icon library
  const icons: Record<string, string> = {
    'users': 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    'calendar': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'check-square': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    'alert-triangle': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    'lock': 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    'wifi-off': 'M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39m10.65 3.4a10.94 10.94 0 01-2.39 5.17m-14.56 0A10.94 10.94 0 014.83 8.61',
    'clock': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      stroke={color}
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[name] || ''} />
    </svg>
  );
};

// Badge Atom
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800'
  };
  
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1 text-sm'
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Input Atom
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  required = false,
  className = ''
}) => {
  const baseClasses = 'block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300';
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`${baseClasses} ${errorClasses} ${disabledClasses}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Card Atom
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  hover = false
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };
  
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg'
  };

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${hover ? 'hover:shadow-md transition-shadow duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Skeleton Atom
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  variant = 'text'
}) => {
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1rem' : undefined)
  };

  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${variantClasses[variant]}
        ${className}
      `}
      style={style}
    />
  );
};
