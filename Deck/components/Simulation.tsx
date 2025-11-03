/**
 * Simulation - Layout testing with inline results
 */

import React, { useState } from 'react';
import { Play, RotateCcw, Save, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface SimulationProps {
  onNavigate: (page: string) => void;
}

export function Simulation({ onNavigate }: SimulationProps) {
  const [placedItems, setPlacedItems] = useState<Array<{ id: string; name: string; zone: string }>>([]);
  const [placedShelves, setPlacedShelves] = useState<Array<{ id: string; type: string; zone: string }>>([]);
  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const availableItems = {
    beverages: [
      { id: 'bev-1', name: 'Coffee Beans', icon: '☕' },
      { id: 'bev-2', name: 'Energy Drinks', icon: '⚡' },
      { id: 'bev-3', name: 'Bottled Water', icon: '💧' },
      { id: 'bev-4', name: 'Juice Boxes', icon: '🧃' }
    ],
    snacks: [
      { id: 'snk-1', name: 'Potato Chips', icon: '🥔' },
      { id: 'snk-2', name: 'Granola Bars', icon: '🍫' },
      { id: 'snk-3', name: 'Trail Mix', icon: '🥜' },
      { id: 'snk-4', name: 'Cookies', icon: '🍪' }
    ],
    others: [
      { id: 'oth-1', name: 'Pasta', icon: '🍝' },
      { id: 'oth-2', name: 'Canned Soup', icon: '🥫' },
      { id: 'oth-3', name: 'Bread', icon: '🍞' },
      { id: 'oth-4', name: 'Cereal', icon: '🥣' }
    ]
  };

  const shelfTypes = [
    { id: 'shelf-3', name: '3-Tier Shelf', height: '36"', icon: '▤' },
    { id: 'shelf-4', name: '4-Tier Shelf', height: '48"', icon: '▦' },
    { id: 'shelf-5', name: '5-Tier Shelf', height: '60"', icon: '▧' }
  ];

  const zones = ['Entry', 'Aisle 1', 'Aisle 2', 'Endcap', 'Checkout'];

  const handleDragStart = (e: React.DragEvent, item: any, type: 'item' | 'shelf') => {
    e.dataTransfer.setData('dragData', JSON.stringify({ ...item, type }));
  };

  const handleDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('dragData'));
    
    if (data.type === 'item') {
      setPlacedItems(prev => [...prev, { id: `${data.id}-${Date.now()}`, name: data.name, zone }]);
      toast.success(`${data.name} added to ${zone}`);
    } else if (data.type === 'shelf') {
      setPlacedShelves(prev => [...prev, { id: `${data.id}-${Date.now()}`, type: data.name, zone }]);
      toast.success(`${data.name} added to ${zone}`);
    }
    
    setHasRun(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemoveItem = (itemId: string) => {
    setPlacedItems(prev => prev.filter(item => item.id !== itemId));
    setHasRun(false);
  };

  const handleRemoveShelf = (shelfId: string) => {
    setPlacedShelves(prev => prev.filter(shelf => shelf.id !== shelfId));
    setHasRun(false);
  };

  const handleReset = () => {
    setPlacedItems([]);
    setPlacedShelves([]);
    setHasRun(false);
    toast.success('Layout reset');
  };

  const handleRunSimulation = () => {
    if (placedItems.length === 0 && placedShelves.length === 0) {
      toast.error('Add items or shelves to run simulation');
      return;
    }

    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setHasRun(true);
      toast.success('Simulation complete — results below');
    }, 1500);
  };

  const handleSavePlan = () => {
    toast.success('Plan saved successfully', {
      action: {
        label: 'View Plans',
        onClick: () => onNavigate('plans')
      }
    });
  };

  // Calculate KPIs based on placements
  const calculateKPIs = () => {
    if (!hasRun) {
      return {
        visibility: 64,
        attention: 28,
        eyeLevel: 58,
        endcap: 35,
        hotspots: 3,
        projectedLift: 0
      };
    }

    const totalPlacements = placedItems.length + placedShelves.length;
    const endcapItems = placedItems.filter(i => i.zone === 'Endcap').length;
    const shelfBonus = placedShelves.length * 2;

    return {
      visibility: Math.min(64 + totalPlacements * 3 + shelfBonus, 95),
      attention: Math.min(28 + totalPlacements * 2, 85),
      eyeLevel: Math.min(58 + totalPlacements * 2 + shelfBonus, 92),
      endcap: Math.min(35 + endcapItems * 8, 88),
      hotspots: Math.min(3 + Math.floor(totalPlacements / 2), 8),
      projectedLift: Math.min(totalPlacements * 1.5 + shelfBonus, 25)
    };
  };

  const kpis = calculateKPIs();

  const resultsData = hasRun ? {
    zonePerformance: zones.map(zone => ({
      zone,
      items: placedItems.filter(i => i.zone === zone).length,
      shelves: placedShelves.filter(s => s.zone === zone).length,
      score: Math.min(50 + (placedItems.filter(i => i.zone === zone).length * 10) + (placedShelves.filter(s => s.zone === zone).length * 5), 95)
    })),
    timeline: [
      { day: 1, visibility: 64 },
      { day: 7, visibility: 68 },
      { day: 14, visibility: 74 },
      { day: 21, visibility: 79 },
      { day: 30, visibility: kpis.visibility }
    ]
  } : null;

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex">
      {/* Sidebar - Items and Shelves */}
      <aside className="w-80 bg-white border-r border-[rgba(33,38,63,0.12)] overflow-auto">
        <div className="p-6 border-b border-[rgba(33,38,63,0.08)]">
          <h3 className="text-[#21263F] mb-1">Available Resources</h3>
          <p className="text-[14px] text-[#676F8E]">Drag items to zones</p>
        </div>

        <Tabs defaultValue="items" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="shelves">Shelves</TabsTrigger>
            </TabsList>
          </div>

          {/* Items Tab */}
          <TabsContent value="items" className="p-6 space-y-4">
            <Tabs defaultValue="beverages" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="beverages" className="text-[13px]">Beverages</TabsTrigger>
                <TabsTrigger value="snacks" className="text-[13px]">Snacks</TabsTrigger>
                <TabsTrigger value="others" className="text-[13px]">Others</TabsTrigger>
              </TabsList>

              {Object.entries(availableItems).map(([category, items]) => (
                <TabsContent key={category} value={category} className="space-y-2">
                  {items.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, 'item')}
                      className="flex items-center gap-3 p-3 bg-[#FAFBFC] border border-[rgba(33,38,63,0.08)] rounded-[12px] cursor-move hover:shadow-md hover:border-[#3D4468] transition-all"
                    >
                      <div className="text-[24px]">{item.icon}</div>
                      <div className="flex-1 text-[15px] text-[#21263F] font-medium">{item.name}</div>
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          </TabsContent>

          {/* Shelves Tab */}
          <TabsContent value="shelves" className="p-6 space-y-3">
            <div className="text-[14px] text-[#676F8E] mb-3">Drag shelf types to zones</div>
            {shelfTypes.map(shelf => (
              <div
                key={shelf.id}
                draggable
                onDragStart={(e) => handleDragStart(e, shelf, 'shelf')}
                className="flex items-center gap-3 p-4 bg-[#FAFBFC] border border-[rgba(33,38,63,0.08)] rounded-[12px] cursor-move hover:shadow-md hover:border-[#3D4468] transition-all"
              >
                <div className="text-[28px]">{shelf.icon}</div>
                <div className="flex-1">
                  <div className="text-[15px] text-[#21263F] font-medium mb-1">{shelf.name}</div>
                  <div className="text-[13px] text-[#676F8E]">{shelf.height}</div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[#21263F]">Layout Simulation</h1>
                <p className="text-[#676F8E] mt-1">Test changes before implementation</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw size={16} className="mr-2" />
                  Reset
                </Button>
                <Button
                  className="bg-[#3D4468] text-white"
                  onClick={handleRunSimulation}
                  disabled={isRunning || (placedItems.length === 0 && placedShelves.length === 0)}
                >
                  <Play size={16} className="mr-2" />
                  {isRunning ? 'Running...' : 'Run Simulation'}
                </Button>
              </div>
            </div>

            {/* KPI Overview */}
            <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#21263F]">Performance Metrics</h3>
                {hasRun && (
                  <Button size="sm" className="bg-[#22C55E] text-white" onClick={handleSavePlan}>
                    <Save size={14} className="mr-2" />
                    Save Plan
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">Visibility</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">{kpis.visibility}</div>
                  {hasRun && <div className="text-[13px] text-[#22C55E] font-semibold mt-1">+{kpis.visibility - 64}</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">Attention</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">{kpis.attention}%</div>
                  {hasRun && <div className="text-[13px] text-[#22C55E] font-semibold mt-1">+{kpis.attention - 28}%</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">Eye-Level</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">{kpis.eyeLevel}</div>
                  {hasRun && <div className="text-[13px] text-[#22C55E] font-semibold mt-1">+{kpis.eyeLevel - 58}</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">End-Cap</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">{kpis.endcap}%</div>
                  {hasRun && <div className="text-[13px] text-[#22C55E] font-semibold mt-1">+{kpis.endcap - 35}%</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">Hotspots</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">{kpis.hotspots}</div>
                  {hasRun && <div className="text-[13px] text-[#22C55E] font-semibold mt-1">+{kpis.hotspots - 3}</div>}
                </div>
                <div className="text-center">
                  <div className="text-[13px] text-[#676F8E] mb-2">Proj. Lift</div>
                  <div className="text-[32px] font-semibold text-[#21263F]">+{kpis.projectedLift.toFixed(1)}%</div>
                  {hasRun && <div className="text-[13px] text-[#3B82F6] font-semibold mt-1"><Eye size={14} className="inline" /></div>}
                </div>
              </div>
            </div>

            {/* Drop Zones */}
            <div className="grid grid-cols-5 gap-4">
              {zones.map(zone => (
                <div
                  key={zone}
                  onDrop={(e) => handleDrop(e, zone)}
                  onDragOver={handleDragOver}
                  className="bg-white border-2 border-dashed border-[rgba(33,38,63,0.2)] rounded-[16px] p-4 min-h-[300px] hover:border-[#3D4468] hover:bg-[#FAFBFC] transition-all"
                >
                  <div className="text-[15px] font-semibold text-[#676F8E] mb-3">{zone}</div>
                  
                  {/* Items in this zone */}
                  <div className="space-y-2 mb-3">
                    {placedItems.filter(item => item.zone === zone).map(item => (
                      <div
                        key={item.id}
                        className="px-3 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-[8px] text-[13px] flex items-center justify-between group"
                      >
                        <span>{item.name.split(' ')[0]}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/80 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Shelves in this zone */}
                  <div className="space-y-2">
                    {placedShelves.filter(shelf => shelf.zone === zone).map(shelf => (
                      <div
                        key={shelf.id}
                        className="px-3 py-2 bg-[#676F8E] text-white rounded-[8px] text-[13px] flex items-center justify-between group"
                      >
                        <span>{shelf.type.split(' ')[0]}</span>
                        <button
                          onClick={() => handleRemoveShelf(shelf.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/80 hover:text-white"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {placedItems.filter(i => i.zone === zone).length === 0 && 
                   placedShelves.filter(s => s.zone === zone).length === 0 && (
                    <div className="text-[13px] text-[#676F8E] text-center mt-8">
                      Drop items or shelves here
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Results - Show inline after running */}
            {hasRun && resultsData && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-t border-[rgba(33,38,63,0.12)] pt-6">
                  <h2 className="text-[#21263F] mb-4">Simulation Results</h2>
                </div>

                {/* Zone Performance */}
                <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[#21263F] mb-4">Zone Performance</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={resultsData.zonePerformance}>
                        <XAxis dataKey="zone" stroke="#676F8E" />
                        <YAxis stroke="#676F8E" />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: '1px solid rgba(33,38,63,0.12)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)'
                          }}
                        />
                        <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={800}>
                          {resultsData.zonePerformance.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 20}, 70%, ${60 - index * 5}%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Projected Timeline */}
                <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
                  <h3 className="text-[#21263F] mb-4">30-Day Visibility Projection</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={resultsData.timeline}>
                        <XAxis dataKey="day" stroke="#676F8E" />
                        <YAxis domain={[0, 100]} stroke="#676F8E" />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'white', 
                            border: '1px solid rgba(33,38,63,0.12)',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px -2px rgba(0,0,0,0.12)'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="visibility" 
                          stroke="url(#blueVioletGradient)" 
                          strokeWidth={3}
                          dot={{ fill: '#3B82F6', r: 5 }}
                          animationDuration={1000}
                        />
                        <defs>
                          <linearGradient id="blueVioletGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
