import { ButtonHTMLAttributes } from 'react';

interface TabButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  children: React.ReactNode;
}

export default function TabButton({ isActive, children, className = '', ...props }: TabButtonProps) {
  return (
    <button
      className={`
        px-6 py-4 text-sm font-medium transition-colors duration-200 border-b-2
        ${
          isActive
            ? 'border-primary-500 text-primary-400'
            : 'border-transparent text-text-tertiary hover:text-text-secondary hover:border-surface-border'
        }
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

