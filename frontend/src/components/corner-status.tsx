import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  status: 'SUCCESS' | 'FAILED';
  children: ReactNode;
  className?: string;
};

export const CornerStatus = ({ status, children, className }: Props) => {
  return (
    <div className={cn('relative p-1', className)}>
      <span>{children}</span>
      <div className="absolute right-0 top-0 -translate-y-1/4 translate-x-1/2">
        {status === 'SUCCESS' ? (
          <Check className="size-4 text-green-600" />
        ) : (
          <X className="size-4 text-red-600" />
        )}
      </div>
    </div>
  );
};
