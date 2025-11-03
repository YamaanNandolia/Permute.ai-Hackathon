/**
 * OptimizeItem - Product analysis with deferred filters and recommendations
 */

import React, { useState } from 'react';
import { Search, X, ChevronDown, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OptimizeItemProps {
  onNavigate: (page: string) => void;
}

const mockProducts = [
  { 
    id: 1, 
    name: 'Organic Pasta', 
    sku: 'PAS-001', 
    category: 'Dry Goods', 
    visibility: 64,
    image: 'https://images.unsplash.com/photo-1506027497629-626def8ddb41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbmljJTIwcGFzdGF8ZW58MXx8fHwxNzYyMTQ2MjY5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  { 
    id: 2, 
    name: 'Tomato Sauce', 
    sku: 'SAU-002', 
    category: 'Canned Goods', 
    visibility: 72,
    image: 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b21hdG8lMjBzYXVjZXxlbnwxfHx8fDE3NjIxNDYyNjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  { 
    id: 3, 
    name: 'Coffee Beans', 
    sku: 'BEV-003', 
    category: 'Beverages', 
    visibility: 58,
    image: 'https://images.unsplash.com/photo-1675306408031-a9aad9f23308?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBiZWFuc3xlbnwxfHx8fDE3NjIwNjM1Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  { 
    id: 4, 
    name: 'Granola Bars', 
    sku: 'SNK-004', 
    category: 'Snacks', 
    visibility: 81,
    image: 'https://images.unsplash.com/photo-1633360821154-1935fb5671e6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFub2xhJTIwYmFyc3xlbnwxfHx8fDE3NjIxMzA0NDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  { 
    id: 5, 
    name: 'Olive Oil', 
    sku: 'OIL-005', 
    category: 'Cooking', 
    visibility: 45,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbHxlbnwxfHx8fDE3NjIwNjYwODR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

export function OptimizeItem({ onNavigate }: OptimizeItemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof mockProducts>([]);
  const [selectedProduct, setSelectedProduct] = useState(mockProducts[0]);
  
  // Pending filters (not yet applied)
  const [pendingFilters, setPendingFilters] = useState<{ category: string; zone: string; shelf: string }>({
    category: '',
    zone: '',
    shelf: ''
  });
  
  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<Array<{ key: string; value: string }>>([]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length > 0) {
      const results = mockProducts.filter(p =>
        p.name.toLowerCase().includes(value.toLowerCase()) ||
        p.sku.toLowerCase().includes(value.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectProduct = (product: typeof mockProducts[0]) => {
    setSelectedProduct(product);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    const newFilters: Array<{ key: string; value: string }> = [];
    
    if (pendingFilters.category) {
      newFilters.push({ key: 'category', value: pendingFilters.category });
    }
    if (pendingFilters.zone) {
      newFilters.push({ key: 'zone', value: pendingFilters.zone });
    }
    if (pendingFilters.shelf) {
      newFilters.push({ key: 'shelf', value: pendingFilters.shelf });
    }
    
    setAppliedFilters(newFilters);
    toast.success('Filters applied');
  };

  const handleRemoveFilter = (key: string) => {
    setAppliedFilters(prev => prev.filter(f => f.key !== key));
    setPendingFilters(prev => ({ ...prev, [key]: '' }));
  };

  const recommendations = [
    {
      action: 'Move to eye-level shelf',
      description: 'Relocate pasta from waist-level to eye-level position',
      impact: '+3–5% attention',
      evidence: [
        'Eye-level products receive 40% more views on average',
        'Similar products saw 4.2% lift in last test'
      ]
    },
    {
      action: 'Place near complementary items',
      description: 'Position adjacent to tomato sauce and cooking oils',
      impact: '+8–12% conversion',
      evidence: [
        'Pasta + sauce adjacency shows 18% lift historically',
        '234 co-occurrences in transaction data'
      ]
    },
    {
      action: 'Increase shelf facings',
      description: 'Add 2 more facings to improve visual prominence',
      impact: '+2–4% visibility',
      evidence: [
        'Products with 4+ facings outperform by 35%',
        'Current 2 facings below category average'
      ]
    }
  ];

  const hasPendingFilters = pendingFilters.category || pendingFilters.zone || pendingFilters.shelf;

  return (
    <div className="min-h-screen bg-[#FAFBFC] p-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-[#21263F]">Optimize Item</h1>
          <p className="text-[#676F8E] mt-1">Analyze and improve product visibility</p>
        </div>

        {/* Search and Filters Row */}
        <div className="flex items-center gap-4">
          {/* Search Bar with Typeahead */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#676F8E]" size={20} />
              <Input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[rgba(33,38,63,0.12)] rounded-[12px] shadow-lg z-10 max-h-[300px] overflow-auto">
                {searchResults.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-[#FAFBFC] transition-colors border-b border-[rgba(33,38,63,0.08)] last:border-0"
                  >
                    <div className="font-medium text-[#21263F]">{product.name}</div>
                    <div className="text-[13px] text-[#676F8E]">{product.sku} • {product.category}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Dropdowns */}
          <select
            value={pendingFilters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 bg-white border border-[rgba(33,38,63,0.12)] rounded-[12px] text-[#21263F] focus:outline-none focus:ring-2 focus:ring-[#676F8E]"
          >
            <option value="">All Categories</option>
            <option value="beverages">Beverages</option>
            <option value="snacks">Snacks</option>
            <option value="dry-goods">Dry Goods</option>
          </select>

          <select
            value={pendingFilters.zone}
            onChange={(e) => handleFilterChange('zone', e.target.value)}
            className="px-4 py-2 bg-white border border-[rgba(33,38,63,0.12)] rounded-[12px] text-[#21263F] focus:outline-none focus:ring-2 focus:ring-[#676F8E]"
          >
            <option value="">All Zones</option>
            <option value="entry">Entry</option>
            <option value="middle">Middle Aisles</option>
            <option value="endcap">Endcaps</option>
          </select>

          <select
            value={pendingFilters.shelf}
            onChange={(e) => handleFilterChange('shelf', e.target.value)}
            className="px-4 py-2 bg-white border border-[rgba(33,38,63,0.12)] rounded-[12px] text-[#21263F] focus:outline-none focus:ring-2 focus:ring-[#676F8E]"
          >
            <option value="">All Shelves</option>
            <option value="eye">Eye-Level</option>
            <option value="waist">Waist-Level</option>
            <option value="floor">Floor-Level</option>
          </select>

          {/* Apply Filters Button */}
          <Button
            onClick={handleApplyFilters}
            disabled={!hasPendingFilters}
            className={hasPendingFilters ? 'bg-[#3D4468] text-white' : ''}
          >
            Apply filters
          </Button>
        </div>

        {/* Applied Filter Chips */}
        {appliedFilters.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] text-[#676F8E]">Active filters:</span>
            {appliedFilters.map((filter, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="pl-3 pr-2 py-1 bg-[#F3F4F6] text-[#21263F] hover:bg-[#E5E7EB] cursor-pointer group"
              >
                {filter.value}
                <button
                  onClick={() => handleRemoveFilter(filter.key)}
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Product Visualization */}
          <div className="col-span-8 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            {/* Product Header with Inline Visibility Score */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-[#21263F] mb-1">{selectedProduct.name}</h3>
                <div className="text-[13px] text-[#676F8E]">{selectedProduct.sku} • {selectedProduct.category}</div>
              </div>
              
              {/* Compact Gauge + Score */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[13px] text-[#676F8E] mb-1">Visibility Score</div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-[32px] font-semibold text-[#21263F]">{selectedProduct.visibility}</div>
                    <div className="text-[14px] text-[#22C55E] font-semibold flex items-center gap-1">
                      <TrendingUp size={14} />
                      +4 vs 30d
                    </div>
                  </div>
                </div>
                
                {/* Mini circular gauge */}
                <svg width="60" height="60" viewBox="0 0 60 60" className="transform -rotate-90">
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="#F3F4F6"
                    strokeWidth="6"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke={selectedProduct.visibility >= 70 ? '#22C55E' : selectedProduct.visibility >= 50 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="6"
                    strokeDasharray={`${(selectedProduct.visibility / 100) * 157} 157`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* Product Image & Heatmap */}
            <div className="grid grid-cols-2 gap-4">
              {/* Product Image */}
              <div className="aspect-square bg-white rounded-[12px] border border-[rgba(33,38,63,0.08)] overflow-hidden">
                <ImageWithFallback
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Heatmap Visualization */}
              <div className="aspect-square bg-gradient-to-br from-[#F3F4F6] to-[#E5E7EB] rounded-[12px] flex items-center justify-center">
                <div className="grid grid-cols-8 gap-1 p-3 w-full h-full">
                  {Array.from({ length: 64 }).map((_, i) => {
                    const isProductLocation = i === 28;
                    const heat = isProductLocation ? selectedProduct.visibility / 100 : Math.random();
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded transition-all hover:scale-110 ${
                          isProductLocation ? 'ring-2 ring-[#3D4468]' : ''
                        }`}
                        style={{
                          backgroundColor: heat > 0.7 ? '#22C55E' : heat > 0.4 ? '#F59E0B' : '#3B82F6',
                          opacity: heat
                        }}
                        title={isProductLocation ? selectedProduct.name : `Zone ${i + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Current Performance - Updates with selection */}
          <div className="col-span-4 bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
            <div className="mb-4">
              <h3 className="text-[#21263F] mb-1">Current performance</h3>
              <div className="text-[13px] text-[#676F8E]">
                {selectedProduct.name} • Metrics scoped to selected item
              </div>
              <div className="flex items-center gap-1 text-[12px] text-[#676F8E] mt-2">
                <Clock size={12} />
                Updated 2 minutes ago
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#676F8E]">Visibility Score</span>
                  <span className="font-semibold text-[#21263F]">{selectedProduct.visibility}/100</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3B82F6] rounded-full transition-all duration-500"
                    style={{ width: `${selectedProduct.visibility}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#676F8E]">Shelf Position</span>
                  <span className="font-semibold text-[#21263F]">Waist-Level</span>
                </div>
                <div className="text-[12px] text-[#525972]">Aisle 3, Bay 2, Position 4</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#676F8E]">Facings</span>
                  <span className="font-semibold text-[#21263F]">2</span>
                </div>
                <div className="text-[12px] text-[#525972]">Below category average (3.5)</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#676F8E]">Traffic Zone</span>
                  <span className="font-semibold text-[#21263F]">Medium</span>
                </div>
                <div className="text-[12px] text-[#525972]">~450 customers/day</div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[13px] text-[#676F8E]">Adjacency Score</span>
                  <span className="font-semibold text-[#21263F]">68/100</span>
                </div>
                <div className="text-[12px] text-[#525972]">Good complementary placement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="bg-white border border-[rgba(33,38,63,0.08)] rounded-[16px] p-6 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]">
          <h3 className="text-[#21263F] mb-4">Recommendations</h3>
          
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="border border-[rgba(33,38,63,0.08)] rounded-[12px] p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-[#21263F] mb-1">{rec.action}</div>
                    <div className="text-[14px] text-[#525972] mb-2">{rec.description}</div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#22C55E]/10 rounded-full">
                      <TrendingUp size={14} className="text-[#22C55E]" />
                      <span className="text-[13px] font-semibold text-[#22C55E]">{rec.impact}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Change applied')}
                    >
                      Apply change
                    </Button>
                  </div>
                </div>

                {/* Collapsible Evidence Panel */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-[13px] text-[#676F8E] hover:text-[#21263F] transition-colors">
                    <ChevronDown size={16} />
                    View evidence
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 pl-6 border-l-2 border-[#F3F4F6]">
                    <ul className="space-y-2">
                      {rec.evidence.map((item, j) => (
                        <li key={j} className="text-[13px] text-[#525972]">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
