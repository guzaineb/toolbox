'use client';

import styles from './RightPanel.module.css';
import { cn } from '@/lib/utils';

interface RightPanelProps {
  children: React.ReactNode;
  centered?: boolean;
  className?: string;
}

export default function RightPanel({ children, centered, className }: RightPanelProps) {
  return (
    <div className={cn(
      'flex-1 bg-white overflow-y-auto',
      'p-6 sm:p-8 md:p-10 lg:p-12 xl:p-[40px_36px]',
      'flex flex-col justify-center',
      centered && 'items-center text-center',
      className
    )}>
      <div className="font-syne text-lg sm:text-xl font-bold text-ink mb-6 sm:mb-8 md:mb-10 flex items-center gap-2">
       
      </div>
      {children}
    </div>
  );
}