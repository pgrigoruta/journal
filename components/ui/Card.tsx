import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  headerActions?: ReactNode;
}

export default function Card({ children, className = '', title, headerActions }: CardProps) {
  return (
    <div className={`bg-surface border border-surface-border rounded-lg p-4 ${className}`}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

