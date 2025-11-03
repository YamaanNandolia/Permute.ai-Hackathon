/**
 * SavedPlans - Plan management with comparison feature
 */

import React, { useState } from 'react';
import { MoreVertical, Copy, Download, Trash2, ExternalLink, Calendar, TrendingUp, GitCompare } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { PlanCompare } from './PlanCompare';

interface SavedPlansProps {
  onNavigate: (page: string) => void;
}

interface Plan {
  id: number;
  name: string;
  created: string;
  modified: string;
  tags: string[];
  visibility: number;
  attention: number;
  eyeLevel: number;
  endcap: number;
  hotspots: number;
  lift: string;
  thumbnail: string;
}

export function SavedPlans({ onNavigate }: SavedPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([
    {
      id: 1,
      name: 'Spring Beverage Optimization',
      created: '2025-10-28',
      modified: '2025-11-01',
      tags: ['Beverages', 'Seasonal'],
      visibility: 82,
      attention: 35,
      eyeLevel: 78,
      endcap: 45,
      hotspots: 5,
      lift: '+15%',
      thumbnail: 'spring'
    },
    {
      id: 2,
      name: 'Eye-Level Endcap Test',
      created: '2025-10-25',
      modified: '2025-10-30',
      tags: ['Endcaps', 'Test'],
      visibility: 76,
      attention: 32,
      eyeLevel: 82,
      endcap: 52,
      hotspots: 4,
      lift: '+12%',
      thumbnail: 'endcap'
    },
    {
      id: 3,
      name: 'Snacks Adjacency Layout',
      created: '2025-10-20',
      modified: '2025-10-27',
      tags: ['Snacks', 'Adjacency'],
      visibility: 88,
      attention: 38,
      eyeLevel: 85,
      endcap: 48,
      hotspots: 6,
      lift: '+18%',
      thumbnail: 'snacks'
    },
    {
      id: 4,
      name: 'Holiday Traffic Flow',
      created: '2025-10-15',
      modified: '2025-10-22',
      tags: ['Holiday', 'Flow'],
      visibility: 79,
      attention: 33,
      eyeLevel: 75,
      endcap: 50,
      hotspots: 5,
      lift: '+14%',
      thumbnail: 'holiday'
    }
  ]);

  const [compareMode, setCompareMode] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<number[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const handleDuplicate = (plan: Plan) => {
    const newPlan = {
      ...plan,
      id: plans.length + 1,
      name: `${plan.name} (Copy)`,
      created: new Date().toISOString().split('T')[0],
      modified: new Date().toISOString().split('T')[0]
    };
    setPlans([...plans, newPlan]);
    toast.success('Plan duplicated');
  };

  const handleExport = (plan: Plan) => {
    toast.success(`Exporting ${plan.name}...`);
  };

  const handleDelete = (planId: number) => {
    setPlans(plans.filter(p => p.id !== planId));
    toast.success('Plan deleted');
  };

  const handleToggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedPlans([]);
  };

  const handleSelectPlan = (planId: number) => {
    if (selectedPlans.includes(planId)) {
      setSelectedPlans(selectedPlans.filter(id => id !== planId));
    } else {
      if (selectedPlans.length < 2) {
        setSelectedPlans([...selectedPlans, planId]);
      } else {
        toast.error('You can only compare 2 plans at a time');
      }
    }
  };

  const handleCompare = () => {
    if (selectedPlans.length === 2) {
      setCompareOpen(true);
    } else {
      toast.error('Please select exactly 2 plans to compare');
    }
  };

  const getThumbnailGradient = (type: string) => {
    const gradients = {
      spring: 'from-green-400 to-blue-500',
      endcap: 'from-purple-400 to-pink-500',
      snacks: 'from-orange-400 to-red-500',
      holiday: 'from-red-500 to-green-500'
    };
    return gradients[type as keyof typeof gradients] || 'from-blue-400 to-purple-500';
  };

  const plan1 = plans.find(p => p.id === selectedPlans[0]) || null;
  const plan2 = plans.find(p => p.id === selectedPlans[1]) || null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#21263F]">Saved Plans</h1>
            <p className="text-[#676F8E] mt-1">{plans.length} layout simulation{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            {compareMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleToggleCompareMode}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-[#3D4468] text-white"
                  onClick={handleCompare}
                  disabled={selectedPlans.length !== 2}
                >
                  <GitCompare size={16} className="mr-2" />
                  Compare ({selectedPlans.length}/2)
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleToggleCompareMode}
                >
                  <GitCompare size={16} className="mr-2" />
                  Compare Plans
                </Button>
                <Button
                  className="bg-[#3D4468] text-white"
                  onClick={() => onNavigate('simulation')}
                >
                  Create New Plan
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Plans List */}
        <div className="grid grid-cols-1 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white border rounded-[16px] p-5 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] transition-all group ${
                selectedPlans.includes(plan.id) 
                  ? 'border-[#3D4468] ring-2 ring-[#3D4468]/20' 
                  : 'border-[rgba(33,38,63,0.08)]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Compare Mode Checkbox */}
                {compareMode && (
                  <div className="pt-2">
                    <Checkbox
                      checked={selectedPlans.includes(plan.id)}
                      onCheckedChange={() => handleSelectPlan(plan.id)}
                    />
                  </div>
                )}

                {/* Thumbnail */}
                <div className={`w-28 h-28 rounded-[12px] bg-gradient-to-br ${getThumbnailGradient(plan.thumbnail)} flex-shrink-0 flex items-center justify-center shadow-lg`}>
                  <div className="grid grid-cols-6 gap-0.5 p-2">
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-white/40 rounded-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Plan Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-[#21263F] mb-1">{plan.name}</h3>
                      <div className="flex items-center gap-3 text-[14px] text-[#676F8E]">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          Modified {plan.modified}
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp size={14} className="text-[#22C55E]" />
                          {plan.lift}
                        </div>
                      </div>
                    </div>

                    {!compareMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={20} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem onClick={() => onNavigate('simulation')}>
                            <ExternalLink size={16} className="mr-2" />
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(plan)}>
                            <Copy size={16} className="mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport(plan)}>
                            <Download size={16} className="mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(plan.id)}
                            className="text-[#EF4444]"
                          >
                            <Trash2 size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {plan.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-[13px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <div className="text-[13px] text-[#676F8E] mb-1">Visibility</div>
                      <div className="text-[20px] font-semibold text-[#21263F]">{plan.visibility}</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#676F8E] mb-1">Attention</div>
                      <div className="text-[20px] font-semibold text-[#21263F]">{plan.attention}%</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#676F8E] mb-1">Eye-Level</div>
                      <div className="text-[20px] font-semibold text-[#21263F]">{plan.eyeLevel}</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#676F8E] mb-1">End-Cap</div>
                      <div className="text-[20px] font-semibold text-[#21263F]">{plan.endcap}%</div>
                    </div>
                    <div>
                      <div className="text-[13px] text-[#676F8E] mb-1">Hotspots</div>
                      <div className="text-[20px] font-semibold text-[#21263F]">{plan.hotspots}</div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                {!compareMode && (
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onNavigate('simulation')}
                    >
                      Open
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {plans.length === 0 && (
          <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-12 text-center">
            <div className="text-[#676F8E] mb-4">No saved plans yet</div>
            <Button
              variant="outline"
              onClick={() => onNavigate('simulation')}
            >
              Create Your First Plan
            </Button>
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      <PlanCompare
        plan1={plan1}
        plan2={plan2}
        isOpen={compareOpen}
        onClose={() => {
          setCompareOpen(false);
          setCompareMode(false);
          setSelectedPlans([]);
        }}
      />
    </div>
  );
}
