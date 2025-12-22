import React from 'react';
import { cn } from '@/utils/cn';

interface ChartContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartContainer({
  title,
  description,
  children,
  className,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-[#0f1f1c]/40 to-[#1e3a34]/40 border border-[#66FF99]/30',
        'p-6 md:p-8 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300',
        'hover:border-[#66FF99]/70 hover:shadow-[0_0_20px_rgba(102,255,153,0.2)]',
        className
      )}
    >
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-white/70">{description}</p>
        )}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
