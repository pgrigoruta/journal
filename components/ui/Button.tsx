import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-2 border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:shadow-none',
  secondary: 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-100 border-2 border-gray-600 hover:border-gray-500 shadow-sm hover:shadow disabled:bg-gray-700 disabled:border-gray-700 disabled:text-gray-400 disabled:shadow-none',
  danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white border-2 border-red-600 hover:border-red-700 shadow-md hover:shadow-lg disabled:bg-gray-600 disabled:border-gray-600 disabled:text-gray-400 disabled:shadow-none',
  ghost: 'bg-transparent hover:bg-gray-700 active:bg-gray-600 text-gray-300 border-2 border-gray-600 hover:border-gray-500',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const focusRingClasses: Record<ButtonVariant, string> = {
    primary: 'focus:ring-primary-500',
    secondary: 'focus:ring-gray-500',
    danger: 'focus:ring-danger-500',
    ghost: 'focus:ring-gray-500',
  };
  
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  const focusRingClass = focusRingClasses[variant];

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${focusRingClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

