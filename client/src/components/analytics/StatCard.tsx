import React from 'react';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  subtext?: string;
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  subtext,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-[#0f1f1c]/40 to-[#1e3a34]/40 border border-[#66FF99]/30',
        'p-6 shadow-lg hover:shadow-xl backdrop-blur-sm transition-all duration-300',
        'hover:border-[#66FF99]/70 hover:shadow-[0_0_20px_rgba(102,255,153,0.2)]',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-white/70 uppercase tracking-wider mb-2">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#66FF99] via-[#00D9FF] to-[#66FF99] bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(102,255,153,0.5)]">
              {value}
            </h3>
            {subtext && (
              <span className="text-xs md:text-sm text-white/60">{subtext}</span>
            )}
          </div>
        </div>
        {icon && (
          <div className="text-2xl md:text-3xl text-[#66FF99]/80 ml-4">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
