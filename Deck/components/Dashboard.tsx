/**
 * Dashboard - Homepage with KPI rail and analytics
 */

import React, { useState, useEffect } from 'react';
import { Download, Plus, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line } from 'recharts';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [season, setSeason] = useState('all');
  const [kpisAnimated, setKpisAnimated] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setKpisAnimated(true), 100);
  }, []);

  // KPI data that changes with season
  const getKPIData = () => {
    const baseData = {
      all: [
        { label: 'Visibility Index', value: 76, delta: '+4.3%', positive: true, sparkline: [68, 70, 72, 71, 74, 75, 76] },
        { label: 'Attention Share', value: 31, delta: '+6%', positive: true, sparkline: [25, 26, 27, 29, 30, 30, 31] },
        { label: 'Top Zone', value: 'Endcaps', delta: '', positive: true, sparkline: [] },
        { label: 'Hotspots', value: 3, delta: '-1', positive: false, sparkline: [5, 4, 4, 4, 3, 3, 3] },
        { label: 'Eye-Level Placement', value: '58/65', delta: '+3', positive: true, sparkline: [] },
        { label: 'End-Cap Utilization', value: 42, delta: '+8%', positive: true, sparkline: [34, 35, 36, 38, 39, 40, 42] },
        { label: 'Projected 30D', value: '+6.8%', delta: '', positive: true, sparkline: [3.2, 3.8, 4.2, 5.0, 5.5, 6.0, 6.8] }
      ],
      spring: [
        { label: 'Visibility Index', value: 78, delta: '+5.1%', positive: true, sparkline: [70, 72, 73, 74, 76, 77, 78] },
        { label: 'Attention Share', value: 33, delta: '+8%', positive: true, sparkline: [26, 27, 28, 30, 31, 32, 33] },
        { label: 'Top Zone', value: 'Entry', delta: '', positive: true, sparkline: [] },
        { label: 'Hotspots', value: 4, delta: '+1', positive: true, sparkline: [3, 3, 4, 4, 4, 4, 4] },
        { label: 'Eye-Level Placement', value: '60/65', delta: '+5', positive: true, sparkline: [] },
        { label: 'End-Cap Utilization', value: 45, delta: '+11%', positive: true, sparkline: [35, 37, 39, 41, 43, 44, 45] },
        { label: 'Projected 30D', value: '+7.2%', delta: '', positive: true, sparkline: [4.0, 4.5, 5.0, 5.8, 6.2, 6.8, 7.2] }
      ],
      summer: [
        { label: 'Visibility Index', value: 74, delta: '+3.8%', positive: true, sparkline: [67, 69, 70, 71, 72, 73, 74] },
        { label: 'Attention Share', value: 29, delta: '+4%', positive: true, sparkline: [24, 25, 26, 27, 28, 28, 29] },
        { label: 'Top Zone', value: 'Coolers', delta: '', positive: true, sparkline: [] },
        { label: 'Hotspots', value: 2, delta: '-2', positive: false, sparkline: [4, 4, 3, 3, 2, 2, 2] },
        { label: 'Eye-Level Placement', value: '56/65', delta: '+1', positive: true, sparkline: [] },
        { label: 'End-Cap Utilization', value: 38, delta: '+5%', positive: true, sparkline: [32, 33, 34, 35, 36, 37, 38] },
        { label: 'Projected 30D', value: '+5.9%', delta: '', positive: true, sparkline: [2.8, 3.2, 3.8, 4.5, 5.0, 5.5, 5.9] }
      ],
      fall: [
        { label: 'Visibility Index', value: 77, delta: '+4.7%', positive: true, sparkline: [69, 71, 73, 74, 75, 76, 77] },
        { label: 'Attention Share', value: 32, delta: '+7%', positive: true, sparkline: [25, 26, 28, 29, 30, 31, 32] },
        { label: 'Top Zone', value: 'Seasonal', delta: '', positive: true, sparkline: [] },
        { label: 'Hotspots', value: 3, delta: '0', positive: true, sparkline: [3, 3, 3, 3, 3, 3, 3] },
        { label: 'Eye-Level Placement', value: '59/65', delta: '+4', positive: true, sparkline: [] },
        { label: 'End-Cap Utilization', value: 44, delta: '+9%', positive: true, sparkline: [35, 37, 39, 40, 42, 43, 44] },
        { label: 'Projected 30D', value: '+7.0%', delta: '', positive: true, sparkline: [3.5, 4.2, 4.8, 5.5, 6.0, 6.5, 7.0] }
      ],
      winter: [
        { label: 'Visibility Index', value: 75, delta: '+4.0%', positive: true, sparkline: [68, 69, 71, 72, 73, 74, 75] },
        { label: 'Attention Share', value: 30, delta: '+5%', positive: true, sparkline: [25, 26, 27, 28, 29, 29, 30] },
        { label: 'Top Zone', value: 'Checkout', delta: '', positive: true, sparkline: [] },
        { label: 'Hotspots', value: 3, delta: '-1', positive: false, sparkline: [4, 4, 4, 3, 3, 3, 3] },
        { label: 'Eye-Level Placement', value: '57/65', delta: '+2', positive: true, sparkline: [] },
        { label: 'End-Cap Utilization', value: 40, delta: '+6%', positive: true, sparkline: [33, 34, 36, 37, 38, 39, 40] },
        { label: 'Projected 30D', value: '+6.3%', delta: '', positive: true, sparkline: [3.0, 3.6, 4.2, 4.9, 5.5, 6.0, 6.3] }
      ]
    };
    return baseData[season as keyof typeof baseData] || baseData.all;
  };

  const kpis = getKPIData();

  const handleSeasonChange = (value: string) => {
    setIsLoading(true);
    setKpisAnimated(false);
    
    // Simulate loading
    setTimeout(() => {
      setSeason(value);
      setIsLoading(false);
      setTimeout(() => setKpisAnimated(true), 50);
    }, 500);
  };

  const handleExport = (format: string) => {
    setExportOpen(false);
    const date = new Date().toISOString().split('T')[0];
    toast.success(`Export complete — visibility_dashboard_${date}.${format}`, {
      action: {
        label: 'Open downloads',
        onClick: () => console.log('Open downloads folder')
      }
    });
  };

  const visibilityDrivers = [
    { name: 'Distance', value: 28, color: '#3B82F6' },
    { name: 'Eye-Level', value: 24, color: '#22C55E' },
    { name: 'Endcap', value: 20, color: '#8B5CF6' },
    { name: 'Facings', value: 18, color: '#F59E0B' },
    { name: 'Congestion', value: 10, color: '#EF4444' }
  ];

  const shelfDistribution = [
    { tier: 'Bottom', products: 15, avgVisibility: 32, percentile: 25 },
    { tier: 'Mid', products: 32, avgVisibility: 58, percentile: 50 },
    { tier: 'Eye', products: 38, avgVisibility: 82, percentile: 75 },
    { tier: 'Top', products: 15, avgVisibility: 45, percentile: 90 }
  ];

  const adjacencyPairs = [
    { pair: 'Chips + Salsa', lift: '+18%', frequency: 234 },
    { pair: 'Pasta + Sauce', lift: '+15%', frequency: 198 },
    { pair: 'Coffee + Creamer', lift: '+12%', frequency: 176 },
    { pair: 'Bread + Butter', lift: '+10%', frequency: 154 }
  ];

  const recentChanges = [
    { action: 'Moved Pasta to Eye-Level', impact: '+12%', time: '2h ago', positive: true },
    { action: 'Adjusted Endcap Display', impact: '+8%', time: '5h ago', positive: true },
    { action: 'Reduced Shelf Spacing', impact: '-3%', time: '1d ago', positive: false },
    { action: 'Optimized Traffic Flow', impact: '+15%', time: '2d ago', positive: true }
  ];

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header with Quick Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#21263F]">Dashboard</h1>
            <p className="text-[#676F8E] mt-1">Store visibility and performance overview</p>
          </div>

          {/* Quick Actions - Compact Icon Strip */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('simulation')}
              className="text-[13px]"
            >
              <Plus size={16} className="mr-1" />
              Add Plan
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('simulation')}
              className="text-[13px]"
            >
              Run Simulation
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[13px]"
            >
              <Users size={16} className="mr-1" />
              Invite
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportOpen(true)}
              className="text-[13px]"
            >
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Season Filter */}
        <div className="flex items-center gap-4">
          <Select value={season} onValueChange={handleSeasonChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Seasons</SelectItem>
              <SelectItem value="spring">Spring</SelectItem>
              <SelectItem value="summer">Summer</SelectItem>
              <SelectItem value="fall">Fall</SelectItem>
              <SelectItem value="winter">Winter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Rail - Compact tiles with sparklines */}
        <div className={`grid grid-cols-7 gap-4 ${isLoading ? 'skeleton' : ''}`}>
          {kpis.map((kpi, i) => (
            <div
              key={i}
              className={`bg-white border border-[rgba(33,38,63,0.08)] rounded-[12px] p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.04)] transition-all duration-300 ${
                kpisAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
              }`}
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className="text-[13px] text-[#676F8E] mb-2">{kpi.label}</div>
              
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-[28px] font-semibold text-[#21263F] tracking-tight">
                  {kpi.value}
                </div>
                {kpi.delta && (
                  <div className={`text-[12px] font-semibold flex items-center gap-0.5 ${
                    kpi.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}>
                    {kpi.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.delta}
                  </div>
                )}
              </div>

              {/* Mini sparkline */}
              {kpi.sparkline && kpi.sparkline.length > 0 && (
                <div className="h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpi.sparkline.map((v, i) => ({ value: v, index: i }))}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={kpi.positive ? '#22C55E' : '#3B82F6'}
                        strokeWidth={2.5}
                        dot={false}
                        animationDuration={800}
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Visibility Drivers - Animated Donut */}
          <div className="col-span-4 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[#21263F] mb-4">Visibility Drivers</h3>
            
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={visibilityDrivers}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={270}
                    endAngle={-90}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                    strokeWidth={2}
                    stroke="#fff"
                  >
                    {visibilityDrivers.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        style={{ 
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white',
                      border: '1px solid rgba(33,38,63,0.12)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              {visibilityDrivers.map((driver, i) => (
                <div key={i} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: driver.color }} />
                    <span className="text-[#525972]">{driver.name}</span>
                  </div>
                  <span className="font-semibold text-[#21263F]">{driver.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shelf-Height Distribution - Dot + Box Plot */}
          <div className="col-span-8 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[#21263F] mb-4">Shelf-Height Distribution</h3>
            
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shelfDistribution} layout="vertical">
                  <XAxis 
                    type="number" 
                    domain={[0, 100]} 
                    stroke="#676F8E"
                    style={{ fontSize: '14px', fontWeight: '500' }}
                  />
                  <YAxis 
                    dataKey="tier" 
                    type="category" 
                    width={80}
                    stroke="#676F8E"
                    style={{ fontSize: '15px', fontWeight: '500' }}
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
                    dataKey="avgVisibility" 
                    radius={[0, 8, 8, 0]}
                    animationDuration={800}
                  >
                    {shelfDistribution.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={`url(#barGradient${index})`}
                      />
                    ))}
                  </Bar>
                  <defs>
                    {shelfDistribution.map((_, index) => (
                      <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.9} />
                      </linearGradient>
                    ))}
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-4 pt-4 border-t border-[rgba(33,38,63,0.08)]">
              {shelfDistribution.map((tier, i) => (
                <div key={i} className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-1">{tier.tier}</div>
                  <div className="text-[20px] font-semibold text-[#21263F]">{tier.products}</div>
                  <div className="text-[12px] text-[#525972]">products</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Adjacency Pairs */}
          <div className="col-span-6 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[#21263F] mb-4">Top Adjacency Pairs</h3>
            
            <div className="space-y-3">
              {adjacencyPairs.map((pair, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-[10px] hover:bg-[#FAFBFC] transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-[#21263F]">{pair.pair}</div>
                    <div className="text-[13px] text-[#676F8E]">{pair.frequency} co-occurrences</div>
                  </div>
                  <div className="text-[20px] font-semibold text-[#22C55E]">{pair.lift}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Changes */}
          <div className="col-span-6 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            <h3 className="text-[#21263F] mb-4">Recent Changes</h3>
            
            <div className="space-y-2">
              {recentChanges.map((change, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-[10px] hover:bg-[#FAFBFC] transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    change.positive ? 'bg-[#22C55E]/10' : 'bg-[#EF4444]/10'
                  }`}>
                    {change.positive ? (
                      <TrendingUp size={16} className="text-[#22C55E]" />
                    ) : (
                      <TrendingDown size={16} className="text-[#EF4444]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#21263F]">{change.action}</div>
                    <div className="text-[13px] text-[#676F8E]">{change.time}</div>
                  </div>
                  
                  <div className={`text-[14px] font-semibold ${
                    change.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}>
                    {change.impact}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Export Dashboard Data</DialogTitle>
            <DialogDescription>
              Choose a format for your export
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 pt-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport('csv')}
            >
              <Download size={16} className="mr-2" />
              Export as CSV
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport('xlsx')}
            >
              <Download size={16} className="mr-2" />
              Export as XLSX
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleExport('png')}
            >
              <Download size={16} className="mr-2" />
              Export as PNG (current view)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
