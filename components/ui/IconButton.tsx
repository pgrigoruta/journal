import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

const variantClasses = {
  default: 'text-text-secondary hover:bg-surface-light hover:text-text-primary',
  danger: 'text-danger-400 hover:bg-danger-900/20 hover:text-danger-300',
};

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

export default function IconButton({
  icon,
  variant = 'default',
  size = 'md',
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon}
    </button>
  );
}

