/**
 * LearningInsights - 6 insight cards with unique visualizations and bottom sheet
 */

import React, { useState } from 'react';
import { TrendingUp, Eye, Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';

interface LearningInsightsProps {
  onNavigate: (page: string) => void;
}

interface Insight {
  id: number;
  title: string;
  description: string;
  impact: string;
  chartType: string;
  data: any[];
  detailContent: {
    headline: string;
    explanation: string;
    metrics: Array<{ label: string; value: string }>;
  };
}

export function LearningInsights({ onNavigate }: LearningInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const insights: Insight[] = [
    {
      id: 1,
      title: 'Attention vs Sales Lift',
      description: 'Products with higher visibility show 3.2x conversion improvement',
      impact: '+12% avg lift',
      chartType: 'scatter',
      data: [
        { attention: 20, sales: 15 },
        { attention: 35, sales: 28 },
        { attention: 50, sales: 45 },
        { attention: 65, sales: 62 },
        { attention: 80, sales: 78 },
        { attention: 90, sales: 88 }
      ],
      detailContent: {
        headline: 'Strong correlation between attention and sales performance',
        explanation: 'Our analysis of 245 products over 6 months shows a clear linear relationship between visibility score and sales lift. Products that moved from low to high visibility zones experienced an average 12% increase in conversion rate within the first 30 days.',
        metrics: [
          { label: 'Correlation coefficient', value: '0.94' },
          { label: 'Average lift (low→high)', value: '+12.3%' },
          { label: 'Products analyzed', value: '245' },
          { label: 'Time period', value: '6 months' }
        ]
      }
    },
    {
      id: 2,
      title: 'Seasonal End-Cap ROI',
      description: 'Summer endcaps underperform vs spring by 18%',
      impact: 'Optimization opportunity',
      chartType: 'column',
      data: [
        { season: 'Spring', roi: 245 },
        { season: 'Summer', roi: 201 },
        { season: 'Fall', roi: 268 },
        { season: 'Winter', roi: 234 }
      ],
      detailContent: {
        headline: 'Fall endcaps deliver highest ROI, summer shows opportunity',
        explanation: 'Seasonal analysis reveals that fall endcap placements generate 33% more revenue per square foot than summer placements. This suggests an opportunity to optimize summer product selection and placement strategies.',
        metrics: [
          { label: 'Fall ROI', value: '$268/sqft' },
          { label: 'Summer ROI', value: '$201/sqft' },
          { label: 'Improvement potential', value: '+33%' },
          { label: 'Recommended action', value: 'Refresh summer mix' }
        ]
      }
    },
    {
      id: 3,
      title: 'Category Visibility Mix',
      description: 'Beverages occupy 35% of eye-level space but drive 52% of revenue',
      impact: 'Well optimized',
      chartType: 'stacked',
      data: [
        { category: 'Current', beverages: 35, snacks: 28, dry: 22, other: 15 },
        { category: 'Optimal', beverages: 40, snacks: 25, dry: 20, other: 15 }
      ],
      detailContent: {
        headline: 'Beverages deserve more eye-level real estate',
        explanation: 'Despite strong performance, beverages are underrepresented in premium eye-level positions. Increasing their allocation from 35% to 40% could yield an additional 6-8% category lift.',
        metrics: [
          { label: 'Current eye-level %', value: '35%' },
          { label: 'Revenue contribution', value: '52%' },
          { label: 'Recommended allocation', value: '40%' },
          { label: 'Expected lift', value: '+6-8%' }
        ]
      }
    },
    {
      id: 4,
      title: 'Planogram Compliance',
      description: 'Current layout matches optimal plan at 78% — improvement needed',
      impact: '+$2.4K/mo if aligned',
      chartType: 'bullet',
      data: [
        { metric: 'Eye-Level', actual: 78, target: 90 },
        { metric: 'Facings', actual: 65, target: 85 },
        { metric: 'Adjacency', actual: 82, target: 90 },
        { metric: 'Spacing', actual: 91, target: 95 }
      ],
      detailContent: {
        headline: 'Execution gaps in eye-level placement and facings',
        explanation: 'While spacing compliance is excellent at 91%, eye-level placement is only at 78% of target. Closing this gap represents a $2,400 monthly revenue opportunity based on historical performance data.',
        metrics: [
          { label: 'Overall compliance', value: '79%' },
          { label: 'Biggest gap', value: 'Eye-level (-12%)' },
          { label: 'Monthly opportunity', value: '$2,400' },
          { label: 'Days to implement', value: '2-3' }
        ]
      }
    },
    {
      id: 5,
      title: 'Shelf Height Effect',
      description: 'Eye-level products outperform floor-level by 3.4x',
      impact: 'Validated hierarchy',
      chartType: 'box',
      data: [
        { tier: 'Floor', min: 15, q1: 22, median: 28, q3: 35, max: 42 },
        { tier: 'Waist', min: 35, q1: 45, median: 58, q3: 68, max: 75 },
        { tier: 'Eye', min: 65, q1: 75, median: 82, q3: 88, max: 95 },
        { tier: 'Top', min: 25, q1: 35, median: 45, q3: 52, max: 60 }
      ],
      detailContent: {
        headline: 'Eye-level tier delivers consistently superior visibility',
        explanation: 'Analysis of 180 products across all shelf heights confirms the primacy of eye-level placement. Median visibility scores at eye-level (82) are nearly triple those at floor-level (28).',
        metrics: [
          { label: 'Eye-level median', value: '82' },
          { label: 'Floor-level median', value: '28' },
          { label: 'Performance ratio', value: '3.4x' },
          { label: 'Products analyzed', value: '180' }
        ]
      }
    },
    {
      id: 6,
      title: 'Hotspot Stability',
      description: 'Entry and endcaps maintain high traffic across all hours',
      impact: 'Prioritize for promos',
      chartType: 'radar',
      data: [
        { zone: 'Entry', morning: 85, afternoon: 92, evening: 78 },
        { zone: 'Endcaps', morning: 88, afternoon: 90, evening: 85 },
        { zone: 'Checkout', morning: 65, afternoon: 70, evening: 95 },
        { zone: 'Middle', morning: 45, afternoon: 52, evening: 48 },
        { zone: 'Back', morning: 30, afternoon: 35, evening: 32 }
      ],
      detailContent: {
        headline: 'Entry and endcaps offer all-day reliability',
        explanation: 'Traffic pattern analysis shows entry and endcap zones maintain 80%+ visibility throughout the day, while checkout zones spike in the evening. This makes entry/endcaps ideal for all-day promotions.',
        metrics: [
          { label: 'Entry avg visibility', value: '85%' },
          { label: 'Endcap avg visibility', value: '88%' },
          { label: 'Time consistency', value: '±7%' },
          { label: 'Promo ROI potential', value: '+22%' }
        ]
      }
    }
  ];

  const handleViewDetails = (insight: Insight) => {
    setSelectedInsight(insight);
  };

  const handleExport = () => {
    if (selectedInsight) {
      const date = new Date().toISOString().split('T')[0];
      console.log(`Exporting insight ${selectedInsight.id} as PNG`);
    }
  };

  const renderChart = (insight: Insight) => {
    switch (insight.chartType) {
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <XAxis 
                dataKey="attention" 
                name="Attention %" 
                stroke="#676F8E"
                style={{ fontSize: '13px', fontWeight: '500' }}
              />
              <YAxis 
                dataKey="sales" 
                name="Sales Lift %" 
                stroke="#676F8E"
                style={{ fontSize: '13px', fontWeight: '500' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ 
                  background: 'white',
                  border: '1px solid rgba(33,38,63,0.12)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)',
                  fontSize: '14px'
                }}
              />
              <Scatter 
                data={insight.data} 
                fill="url(#scatterGradient)"
                animationDuration={800}
              >
                {insight.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }} />
                ))}
              </Scatter>
              <defs>
                <linearGradient id="scatterGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </ScatterChart>
          </ResponsiveContainer>
        );
      
      case 'column':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insight.data}>
              <XAxis 
                dataKey="season"
                stroke="#676F8E"
                style={{ fontSize: '13px', fontWeight: '500' }}
              />
              <YAxis 
                stroke="#676F8E"
                style={{ fontSize: '13px', fontWeight: '500' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white',
                  border: '1px solid rgba(33,38,63,0.12)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)',
                  fontSize: '14px'
                }}
              />
              <Bar 
                dataKey="roi" 
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                strokeWidth={2}
                stroke="#fff"
              >
                {insight.data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={['#22C55E', '#F59E0B', '#3B82F6', '#8B5CF6'][index]}
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'stacked':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insight.data} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="category" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="beverages" stackId="a" fill="#3B82F6" />
              <Bar dataKey="snacks" stackId="a" fill="#22C55E" />
              <Bar dataKey="dry" stackId="a" fill="#F59E0B" />
              <Bar dataKey="other" stackId="a" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'bullet':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insight.data} layout="vertical">
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="metric" type="category" width={80} />
              <Tooltip />
              <Bar dataKey="actual" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'box':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insight.data}>
              <XAxis dataKey="tier" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="median" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        const radarData = insight.data.map(d => ({
          zone: d.zone,
          value: (d.morning + d.afternoon + d.evening) / 3
        }));
        return (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="zone" />
              <PolarRadiusAxis domain={[0, 100]} />
              <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[#21263F]">Learning Insights</h1>
          <p className="text-[#676F8E] mt-1">AI-powered patterns and optimization opportunities</p>
        </div>

        {/* Insight Cards Grid */}
        <div className="grid grid-cols-2 gap-6">
          {insights.map((insight) => (
            <div
              key={insight.id}
              className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.32)] transition-all duration-200 hover:-translate-y-1 cursor-pointer"
              onClick={() => handleViewDetails(insight)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[#21263F] mb-2">{insight.title}</h3>
                  <p className="text-[14px] text-[#525972] mb-3">{insight.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3B82F6]/10 rounded-full">
                    <TrendingUp size={14} className="text-[#3B82F6]" />
                    <span className="text-[13px] font-semibold text-[#3B82F6]">{insight.impact}</span>
                  </div>
                </div>
                <Eye size={20} className="text-[#676F8E]" />
              </div>

              {/* Chart Preview */}
              <div className="h-[180px] mt-4">
                {renderChart(insight)}
              </div>

              <div className="mt-4 pt-4 border-t border-[rgba(33,38,63,0.08)]">
                <Button variant="ghost" size="sm" className="text-[#3D4468]">
                  View Details →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet for Details */}
      <Sheet open={selectedInsight !== null} onOpenChange={() => setSelectedInsight(null)}>
        <SheetContent
          side="bottom"
          className="h-[720px] bg-white border-t border-[rgba(33,38,63,0.12)] p-0"
        >
          {selectedInsight && (
            <div className="h-full flex flex-col">
              {/* Drag Handle */}
              <div className="flex items-center justify-center py-3">
                <div className="w-12 h-1 bg-[#E5E7EB] rounded-full" />
              </div>

              {/* Header */}
              <div className="px-8 py-4 border-b border-[rgba(33,38,63,0.08)] flex items-center justify-between">
                <div>
                  <h2 className="text-[#21263F]">Deep dive: {selectedInsight.title}</h2>
                  <p className="text-[14px] text-[#676F8E] mt-1">{selectedInsight.detailContent.headline}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download size={16} className="mr-2" />
                    Export as PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    Export as CSV
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedInsight(null)}>
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-8">
                <div className="max-w-[1200px] mx-auto grid grid-cols-2 gap-8">
                  {/* Left: Expanded Chart */}
                  <div>
                    <h3 className="text-[#21263F] mb-4">Visualization</h3>
                    <div className="h-[400px] bg-white border border-[rgba(33,38,63,0.08)] rounded-[12px] p-6">
                      {renderChart(selectedInsight)}
                    </div>
                  </div>

                  {/* Right: Explanation and Metrics */}
                  <div>
                    <h3 className="text-[#21263F] mb-4">Analysis</h3>
                    <p className="text-[16px] text-[#525972] mb-6 leading-relaxed">
                      {selectedInsight.detailContent.explanation}
                    </p>

                    <h4 className="text-[18px] font-semibold text-[#21263F] mb-4">Key Metrics</h4>
                    <div className="space-y-4">
                      {selectedInsight.detailContent.metrics.map((metric, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 bg-[#FAFBFC] rounded-[10px]"
                        >
                          <span className="text-[14px] text-[#676F8E]">{metric.label}</span>
                          <span className="text-[18px] font-semibold text-[#21263F]">{metric.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-[rgba(33,38,63,0.08)]">
                      <Button
                        className="w-full bg-[#3D4468] text-white"
                        onClick={() => {
                          setSelectedInsight(null);
                          onNavigate('simulation');
                        }}
                      >
                        Open in Simulation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
