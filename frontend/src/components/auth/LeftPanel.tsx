'use client';

import { cn } from '@/lib/utils';
import styles from './LeftPanel.module.css';

interface StatItem {
  num: string;
  label: string;
}

interface Testimonial {
  text: string;
  initials: string;
  name: string;
}

interface LeftPanelProps {
  tag: string;
  title: string;
  subtitle: string;
  stats?: StatItem[];
  testimonial?: Testimonial;
  svgContent: React.ReactNode;
  className?: string;
}

export default function LeftPanel({tag, title,
  subtitle,
  stats,
  testimonial,
  svgContent,
  className,
}: LeftPanelProps) {
  return (
    <div className={cn(
      'relative overflow-hidden flex flex-col justify-end',
      'w-full lg:w-[44%]',
      'bg-[#0f1f16]',
      'p-6 sm:p-8 md:p-10 lg:p-9 xl:p-[36px]',
      className
    )}>
      {/* Canvas SVG animé */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        {svgContent}
      </div>

      {/* Contenu */}
      <div className="relative z-10">
        <div className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[#5d9e78] mb-4 sm:mb-5 md:mb-6 lg:mb-7">
          {tag}
        </div>
        <h2 className="font-syne text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight mb-2 sm:mb-3">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#6b8f7a] leading-relaxed mb-4 sm:mb-5 md:mb-6 lg:mb-7">
          {subtitle}
        </p>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-2 sm:p-2.5 md:p-3">
                <div className="font-syne text-lg sm:text-xl font-bold text-white">{s.num}</div>
                <div className="text-[9px] sm:text-[10px] text-[#5d9e78] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {testimonial && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 sm:p-3.5 md:p-4 mt-3 sm:mt-4">
            <p className="text-[11px] sm:text-xs text-[#a0bcaa] italic leading-relaxed mb-2 sm:mb-3">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-6 h-6 sm:w-[26px] sm:h-[26px] rounded-full bg-gradient-to-br from-[#2d7a52] to-[#1a5c3a] flex items-center justify-center text-[9px] sm:text-[10px] font-semibold text-[#a0e0b8]">
                {testimonial.initials}
              </div>
              <div className="text-[10px] sm:text-[11px] text-[#6b8f7a] font-medium">
                {testimonial.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}