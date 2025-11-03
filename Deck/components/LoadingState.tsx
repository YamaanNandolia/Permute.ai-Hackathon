import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-[#676F8E]" />
      <p className="text-white/60" style={{ fontWeight: 400 }}>
        {message}
      </p>
    </div>
  );
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-center px-8">
      {icon && <div className="text-white/20 mb-2">{icon}</div>}
      <h3 className="text-white/60" style={{ fontWeight: 600 }}>
        {title}
      </h3>
      {description && (
        <p className="text-white/40 text-sm max-w-md" style={{ fontWeight: 400 }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
