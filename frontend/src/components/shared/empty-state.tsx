import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  icon?: React.ElementType;
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  actionOnClick,
  icon: Icon = FolderOpen
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed bg-muted/30">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        {description}
      </p>
      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button>{actionLabel}</Button>
            </Link>
          ) : (
            <Button onClick={actionOnClick}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  );
}
