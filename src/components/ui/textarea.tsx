import * as React from 'react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex w-full px-3.5 py-2.5 bg-ds-surface2 border border-ds-border rounded-xl',
          'text-sm text-ds-text placeholder:text-ds-muted',
          'focus:outline-none focus:ring-2 focus:ring-ds-accent/30 focus:border-ds-accent/60',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
