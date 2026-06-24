import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
}

export function PageHeader({ title, description, actionButton, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actionButton && (
          actionButton.href ? (
            <Link href={actionButton.href}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {actionButton.label}
              </Button>
            </Link>
          ) : (
            <Button onClick={actionButton.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {actionButton.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
