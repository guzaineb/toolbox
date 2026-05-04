'use client';

import { AvailabilityStatus, AVAILABILITY_LABELS, AVAILABILITY_BG_COLORS } from '@/types/expert';

interface AvailabilityBadgeProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function AvailabilityBadge({ status, size = 'md', showLabel = true }: AvailabilityBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${AVAILABILITY_BG_COLORS[status]}`}>
      <span className={`mr-1.5 h-${size === 'sm' ? '1.5' : size === 'md' ? '2' : '2.5'} w-${size === 'sm' ? '1.5' : size === 'md' ? '2' : '2.5'} rounded-full bg-current`} />
      {showLabel && AVAILABILITY_LABELS[status]}
    </span>
  );
}