import React from 'react';
import { WorkOrderStatus } from '@/lib/types';
import { Check, Clock, Play, Pause, CheckCircle2 } from 'lucide-react';

interface StatusBadgeProps {
  status: WorkOrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
    lg: 'text-sm px-3.5 py-1.5 font-black',
  };

  switch (status) {
    case 'NEW':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-300 font-black ${sizeClasses[size]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          <span>NEW</span>
        </span>
      );

    case 'ACCEPTED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 ${sizeClasses[size]}`}
        >
          <Check className="w-3 h-3" />
          <span>ACCEPTED</span>
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 ${sizeClasses[size]}`}
        >
          <Play className="w-3 h-3 fill-amber-700 text-amber-700" />
          <span>IN PROGRESS</span>
        </span>
      );

    case 'WAITING':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-fuchsia-100 text-fuchsia-800 border border-fuchsia-300 ${sizeClasses[size]}`}
        >
          <Pause className="w-3 h-3 fill-fuchsia-700 text-fuchsia-700" />
          <span>WAITING (HOLD)</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses[size]}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>COMPLETED</span>
        </span>
      );

    case 'CLOSED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-lg bg-slate-200 text-slate-700 border border-slate-300 ${sizeClasses[size]}`}
        >
          <Check className="w-3 h-3" />
          <span>CLOSED ✓</span>
        </span>
      );

    default:
      return null;
  }
}
