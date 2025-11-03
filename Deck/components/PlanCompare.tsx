/**
 * PlanCompare - Side-by-side comparison modal
 */

import React from 'react';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';

interface Plan {
  id: number;
  name: string;
  visibility: number;
  attention: number;
  eyeLevel: number;
  endcap: number;
  hotspots: number;
  lift: string;
}

interface PlanCompareProps {
  plan1: Plan | null;
  plan2: Plan | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PlanCompare({ plan1, plan2, isOpen, onClose }: PlanCompareProps) {
  if (!plan1 || !plan2) return null;

  const getDelta = (val1: number, val2: number) => {
    const diff = val2 - val1;
    return {
      value: Math.abs(diff),
      isPositive: diff > 0,
      isZero: diff === 0
    };
  };

  const metrics = [
    { key: 'visibility', label: 'Visibility Index', val1: plan1.visibility, val2: plan2.visibility },
    { key: 'attention', label: 'Attention Share', val1: plan1.attention, val2: plan2.attention, suffix: '%' },
    { key: 'eyeLevel', label: 'Eye-Level Placement', val1: plan1.eyeLevel, val2: plan2.eyeLevel },
    { key: 'endcap', label: 'End-Cap Utilization', val1: plan1.endcap, val2: plan2.endcap, suffix: '%' },
    { key: 'hotspots', label: 'Active Hotspots', val1: plan1.hotspots, val2: plan2.hotspots }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] bg-white p-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <DialogTitle className="text-[#21263F] mb-2">Plan Comparison</DialogTitle>
              <DialogDescription className="text-[15px] text-[#676F8E]">
                Side-by-side KPI analysis
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>

          {/* Plan Names */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-[16px] p-6 text-white">
              <div className="text-[14px] opacity-80 mb-1">Plan A</div>
              <h3 className="text-white">{plan1.name}</h3>
              <div className="mt-3 text-[20px] font-semibold">{plan1.lift}</div>
            </div>
            <div className="bg-gradient-to-r from-violet-500 to-purple-500 rounded-[16px] p-6 text-white">
              <div className="text-[14px] opacity-80 mb-1">Plan B</div>
              <h3 className="text-white">{plan2.name}</h3>
              <div className="mt-3 text-[20px] font-semibold">{plan2.lift}</div>
            </div>
          </div>

          {/* Metrics Comparison */}
          <div className="space-y-4">
            {metrics.map((metric) => {
              const delta = getDelta(metric.val1, metric.val2);
              
              return (
                <div
                  key={metric.key}
                  className="bg-[#FAFBFC] border border-[rgba(33,38,63,0.08)] rounded-[12px] p-4"
                >
                  <div className="text-[14px] text-[#676F8E] mb-3 font-medium">{metric.label}</div>
                  
                  <div className="grid grid-cols-2 gap-8">
                    {/* Plan 1 */}
                    <div className="flex items-baseline justify-between">
                      <div className="text-[32px] font-semibold text-[#21263F]">
                        {metric.val1}{metric.suffix || ''}
                      </div>
                      {!delta.isZero && (
                        <div className={`flex items-center gap-1 text-[15px] font-semibold ${
                          delta.isPositive ? 'text-[#EF4444]' : 'text-[#22C55E]'
                        }`}>
                          {delta.isPositive ? (
                            <>
                              <TrendingDown size={16} />
                              -{delta.value}{metric.suffix || ''}
                            </>
                          ) : (
                            <>
                              <TrendingUp size={16} />
                              +{delta.value}{metric.suffix || ''}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Plan 2 */}
                    <div className="flex items-baseline justify-between">
                      <div className="text-[32px] font-semibold text-[#21263F]">
                        {metric.val2}{metric.suffix || ''}
                      </div>
                      {!delta.isZero && (
                        <div className={`flex items-center gap-1 text-[15px] font-semibold ${
                          !delta.isPositive ? 'text-[#EF4444]' : 'text-[#22C55E]'
                        }`}>
                          {!delta.isPositive ? (
                            <>
                              <TrendingDown size={16} />
                              -{delta.value}{metric.suffix || ''}
                            </>
                          ) : (
                            <>
                              <TrendingUp size={16} />
                              +{delta.value}{metric.suffix || ''}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual bar comparison */}
                  <div className="mt-3 grid grid-cols-2 gap-8">
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all"
                        style={{ width: `${(metric.val1 / 100) * 100}%` }}
                      />
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${(metric.val2 / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-violet-50 rounded-[12px] border border-[rgba(33,38,63,0.08)]">
            <div className="text-[15px] font-semibold text-[#21263F] mb-2">
              Recommendation
            </div>
            <p className="text-[15px] text-[#525972]">
              {plan2.visibility > plan1.visibility 
                ? `Plan B shows ${plan2.visibility - plan1.visibility} point visibility improvement and is recommended for implementation.`
                : plan1.visibility > plan2.visibility
                ? `Plan A shows ${plan1.visibility - plan2.visibility} point visibility improvement and is recommended for implementation.`
                : 'Both plans show similar performance. Consider other factors for selection.'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
