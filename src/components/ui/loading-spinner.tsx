import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
};

const LoadingSpinner = ({ 
  className, 
  size = 'md', 
  text = '加载中...' 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-8 px-4",
      className
    )}>
      <Loader2 className={cn(
        "animate-spin text-gray-500",
        sizeClasses[size]
      )} />
      {text && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 