import { ChevronRight, LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color?: string;
}

export function QuickAction({ title, description, icon: Icon, path, color }: QuickActionProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98]"
    >
      <div
        className="p-3 rounded-xl"
        style={{ backgroundColor: color ? `${color}20` : undefined }}
      >
        <Icon className="h-5 w-5" style={{ color: color || 'hsl(var(--primary))' }} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}
