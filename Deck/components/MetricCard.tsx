import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: 'default' | 'green' | 'blue' | 'orange' | 'red';
  trend?: React.ReactNode;
  tooltip?: string;
}

const colorClasses = {
  default: 'text-white',
  green: 'text-green-400',
  blue: 'text-blue-400',
  orange: 'text-orange-400',
  red: 'text-red-400',
};

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
  trend,
  tooltip,
}: MetricCardProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-white/60 text-sm" style={{ fontWeight: 400 }}>
          {label}
        </span>
        {Icon && (
          <div className="w-6 h-6 rounded-full bg-[#676F8E]/20 flex items-center justify-center cursor-help group relative">
            <Icon className="w-3 h-3 text-[#676F8E]" />
            {tooltip && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-[#21263F] border border-white/10 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className={`${colorClasses[color]}`} style={{ fontSize: '36px', fontWeight: 700 }}>
            {value}
          </div>
          {subtitle && (
            <div className="text-xs text-white/60" style={{ fontWeight: 400 }}>
              {subtitle}
            </div>
          )}
        </div>
        {trend && <div className="h-16 w-24">{trend}</div>}
      </div>
    </div>
  );
}
