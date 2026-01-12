import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  action?: {
    label: string;
    path: string;
  };
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('flex items-center justify-between mb-3', className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {action && (
        <button
          onClick={() => navigate(action.path)}
          className="text-sm font-medium text-primary flex items-center gap-1"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
