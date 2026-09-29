import React, { useState } from 'react';
import { 
  Target, Building, Search, Filter, ShieldCheck, 
  AlertCircle, ArrowUpRight, Eye, Crosshair, MapPin 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ObjectItem } from '../types';

export const ObjectPage: React.FC = () => {
  const { 
    currentResult, 
    selectedObjectId, 
    setSelectedObjectId, 
    setActiveTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const objects: ObjectItem[] = currentResult?.objects?.objects || [];
  const selectedObj = objects.find((o: ObjectItem) => o.id === selectedObjectId) || objects[0];

  const filteredObjects = objects.filter((o: ObjectItem) => {
    const matchesSearch = o.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = selectedTier === 'all' || o.elevation_tier.toLowerCase().includes(selectedTier.toLowerCase());
    return matchesSearch && matchesTier;
  });

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <span>Structural Object Inventory & Morphological Analysis</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Segmented building footprints, estimated vertical elevations, and 3D spatial beacons.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-navy-900 border border-cyan-500/30 text-cyan-300">
            TOTAL STRUCTURES: <span className="font-bold text-white">{objects.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Objects Table & Filters */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass space-y-4 flex flex-col">
          
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by ID or Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-400 pl-9 pr-3 py-1.5 rounded-lg text-xs font-mono text-white placeholder-slate-500"
              />
            </div>

            {/* Elevation Tier Filter */}
            <div className="flex items-center space-x-1.5 text-xs font-mono w-full sm:w-auto">
              <span className="text-slate-500 text-[10px]">TIER:</span>
              <div className="flex space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {['all', 'high', 'medium', 'low'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`px-2.5 py-0.5 rounded text-[11px] uppercase transition ${
                      selectedTier === tier 
                        ? 'bg-cyan-500 text-navy-950 font-bold' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider">
                  <th className="pb-2 pl-2">OBJECT ID</th>
                  <th className="pb-2">CLASSIFICATION</th>
                  <th className="pb-2">EST. HEIGHT</th>
                  <th className="pb-2">FOOTPRINT AREA</th>
                  <th className="pb-2">CONFIDENCE</th>
                  <th className="pb-2 pr-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredObjects.map((obj: ObjectItem) => {
                  const isSelected = selectedObjectId === obj.id;
                  return (
                    <tr
                      key={obj.id}
                      onClick={() => setSelectedObjectId(obj.id)}
                      className={`hover:bg-cyan-950/20 cursor-pointer transition ${
                        isSelected ? 'bg-cyan-500/15 border-l-2 border-cyan-400' : ''
                      }`}
                    >
                      <td className="py-3 pl-2 font-bold text-slate-200">
                        {obj.id}
                      </td>
                      <td className="py-3">
                        <div className="text-slate-300">{obj.label}</div>
                        <div className="text-[10px] text-slate-500">{obj.category}</div>
                      </td>
                      <td className="py-3 font-bold text-cyan-300">
                        {obj.estimated_height} {obj.height_unit}
                      </td>
                      <td className="py-3 text-slate-400">
                        {obj.footprint_area_sqm} m²
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-12 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{ width: `${obj.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {(obj.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedObjectId(obj.id);
                            setActiveTab('reconstruction');
                          }}
                          title="Locate in 3D scene"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-cyan-500 hover:text-navy-950 text-slate-300 transition text-[10px]"
                        >
                          View 3D
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredObjects.length === 0 && (
              <div className="text-center py-12 text-slate-500 font-mono text-xs">
                No matching structures identified.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Object Inspector Detail Card */}
        <div className="space-y-4">
          <div className="bg-navy-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-glass space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Structure Inspector
                </h3>
              </div>
              {selectedObj && (
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {selectedObj.id}
                </span>
              )}
            </div>

            {selectedObj ? (
              <div className="space-y-3.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">DESCRIPTOR</span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedObj.label}
                  </div>
                  <div className="text-xs text-cyan-300 mt-0.5">
                    {selectedObj.category}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">ESTIMATED HEIGHT</span>
                    <span className="text-base font-bold text-rose-400 mt-0.5 block">
                      {selectedObj.estimated_height} {selectedObj.height_unit}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">ELEVATION TIER</span>
                    <span className="text-xs font-bold text-amber-300 mt-1 block">
                      {selectedObj.elevation_tier}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">FOOTPRINT AREA</span>
                    <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                      {selectedObj.footprint_area_sqm} m²
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 block">DETECTION CONFIDENCE</span>
                    <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                      {(selectedObj.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 block uppercase">3D SPATIAL CENTROID</span>
                  <div className="bg-slate-950 p-2 rounded border border-slate-800 text-[11px] text-slate-300">
                    X: {selectedObj.centroid_3d[0].toFixed(1)} | Y: {selectedObj.centroid_3d[1].toFixed(1)} | Z: {selectedObj.centroid_3d[2].toFixed(1)}
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('reconstruction')}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-navy-950 font-bold rounded-lg shadow-glow-cyan flex items-center justify-center space-x-2 transition"
                >
                  <Eye className="w-4 h-4 fill-navy-950" />
                  <span>Highlight in 3D Reconstructed Mesh</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                Select an object from the inventory to inspect.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
