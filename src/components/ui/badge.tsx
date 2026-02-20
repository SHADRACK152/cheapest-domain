import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'success' | 'destructive';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
        {
          'bg-primary-100 text-primary-700': variant === 'default',
          'bg-gray-100 text-gray-700': variant === 'secondary',
          'bg-green-100 text-green-700': variant === 'success',
          'bg-red-100 text-red-700': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
