import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusVariant = 
  | 'success' 
  | 'warning' 
  | 'destructive' 
  | 'secondary' 
  | 'default'
  | 'info';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

// Maps backend enums to UI variants
const statusVariantMap: Record<string, StatusVariant> = {
  // Booking/Hotel/Generic active states
  active: 'success',
  confirmed: 'success',
  completed: 'success',
  
  // Room Statuses
  available: 'success',
  occupied: 'default',
  reserved: 'info',
  dirty: 'warning',
  cleaning: 'warning',
  maintenance: 'destructive',
  out_of_service: 'destructive',
  
  // Inactive/Negative
  inactive: 'secondary',
  cancelled: 'destructive',
  draft: 'secondary',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const variant = statusVariantMap[normalizedStatus] || 'default';
  
  // Format text: out_of_service -> Out Of Service
  const formattedText = status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const variantClasses = {
    success: 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300',
    destructive: 'bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300',
    default: '',
    secondary: '',
  };

  return (
    <Badge 
      variant={variant === 'success' || variant === 'warning' || variant === 'info' ? 'outline' : variant} 
      className={cn(variantClasses[variant], className)}
    >
      {formattedText}
    </Badge>
  );
}
