import React from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface KPITileProps {
  title: string;
  value: string | number;
  unit?: string;
  delta?: {
    value: string;
    direction: 'up' | 'down';
  };
  sparkline?: Array<{ value: number }>;
  tooltip?: string;
  target?: {
    current: number;
    target: number;
  };
}

export function KPITile({ title, value, unit, delta, sparkline, tooltip, target }: KPITileProps) {
  return (
    <div className="kpi-tile rm-card-hairline">
      {/* Header with title and tooltip */}
      <div className="flex items-center justify-between mb-3">
        <span 
          className="text-[#676F8E]" 
          style={{ fontSize: '12px', fontWeight: 400 }}
        >
          {title}
        </span>
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-[#676F8E] hover:text-[#525972] transition-colors">
                  <Info className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-[200px]">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Value and Delta */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span 
              className="text-[#21263F]" 
              style={{ fontSize: '32px', fontWeight: 600, lineHeight: 1 }}
            >
              {value}
            </span>
            {unit && (
              <span 
                className="text-[#676F8E]" 
                style={{ fontSize: '14px', fontWeight: 400 }}
              >
                {unit}
              </span>
            )}
          </div>
          
          {delta && (
            <div className={`delta-pill delta-pill-${delta.direction === 'up' ? 'green' : 'red'} mt-2`} style={{ fontSize: '11px' }}>
              {delta.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {delta.value}
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparkline && (
          <div className="h-12 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#676F8E"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Bullet chart for targets */}
        {target && (
          <div className="flex flex-col items-end gap-1">
            <div className="w-20 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#676F8E] rounded-full transition-all"
                style={{ width: `${(target.current / target.target) * 100}%` }}
              />
            </div>
            <span className="text-[#676F8E]" style={{ fontSize: '10px', fontWeight: 400 }}>
              Target: {target.target}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
