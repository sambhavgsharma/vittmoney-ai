import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl bg-white/10 border border-white/20 shadow-lg backdrop-blur-md p-6 transition-all',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export default Card;
