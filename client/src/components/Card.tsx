import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-[2.2rem] bg-white/30 dark:bg-white/10 border border-white/20 shadow-2xl backdrop-blur-2xl p-6 md:p-8 transition-all',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

export default Card;
