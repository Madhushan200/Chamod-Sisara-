import React from 'react';
import { Priority } from '@/lib/types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-black',
  };

  if (priority === 'P1') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-black rounded-lg bg-red-100 text-red-700 border border-red-300 shadow-2xs animate-pulse ${sizeClasses[size]}`}
      >
        <span className="w-2 h-2 rounded-full bg-red-600" />
        <span>P1 – EMERGENCY</span>
      </span>
    );
  }

  if (priority === 'P2') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-orange-100 text-orange-800 border border-orange-300 ${sizeClasses[size]}`}
      >
        <span className="w-2 h-2 rounded-full bg-orange-500" />
        <span>P2 – HIGH</span>
      </span>
    );
  }

  if (priority === 'P3') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-amber-50 text-amber-800 border border-amber-300 ${sizeClasses[size]}`}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>P3 – NORMAL</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 ${sizeClasses[size]}`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span>P4 – PLANNED</span>
    </span>
  );
}
