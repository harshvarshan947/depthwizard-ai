import React from 'react';
import { 
  Mountain, Sliders, BarChart3, ShieldCheck, 
  AlertCircle, ArrowUpRight, TrendingUp, Layers 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';
import { HeightLegend } from '../components/common/HeightLegend';
import { CalibrationPanel } from '../components/common/CalibrationPanel';

export const HeightPage: React.FC = () => {
  const { currentResult, calibration } = useApp();

  const heightData = currentResult?.height;
  const unit = heightData?.unit || 'rel-units';

  const histogramData = heightData?.histogram || [
    { height_range: '0-5m', count: 120, percentage: 12 },
    { height_range: '5-10m', count: 240, percentage: 24 },
    { height_range: '10-15m', count: 310, percentage: 31 },
    { height_range: '15-20m', count: 180, percentage: 18 },
    { height_range: '20-30m', count: 95, percentage: 9.5 },
    { height_range: '30-45m', count: 55, percentage: 5.5 }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Mountain className="w-5 h-5 text-cyan-400" />
            <span>Height Estimation & Hypsometric Modeling</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Photogrammetric elevation derivation, surface contour mapping, and metric calibration.
          </p>
        </div>

        {/* Status */}
        <div className="flex items-center space-x-2">
          {calibration.is_calibrated ? (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>METRIC ABSOLUTE HEIGHT ({unit})</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4" />
              <span>RELATIVE HEIGHT ESTIMATE</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Primary Height Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            MAX HEIGHT
          </div>
          <div className="text-2xl font-mono font-extrabold text-rose-400 mt-1">
            {heightData?.max_height ?? '--'} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Highest Structural Peak
          </div>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            AVERAGE HEIGHT
          </div>
          <div className="text-2xl font-mono font-extrabold text-emerald-400 mt-1">
            {heightData?.average_height ?? '--'} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Scene Mean Surface
          </div>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            MIN HEIGHT (GROUND)
          </div>
          <div className="text-2xl font-mono font-extrabold text-cyan-300 mt-1">
            {heightData?.min_height ?? '--'} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Estimated Ground Datum
          </div>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            DYNAMIC HEIGHT RANGE
          </div>
          <div className="text-2xl font-mono font-extrabold text-amber-300 mt-1">
            {heightData?.height_range ?? '--'} <span className="text-xs text-slate-400">{unit}</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Total Vertical Relief
          </div>
        </div>
      </div>

      {/* Main Grid: Height Map Heatmap + Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Height Field Heatmap */}
        <div className="bg-navy-900/90 border border-cyan-500/20 rounded-2xl p-5 shadow-glass flex flex-col space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              HYPSOMETRIC ELEVATION HEATMAP
            </span>
            <span className="text-xs font-mono text-cyan-400">
              {calibration.elevation_datum}
            </span>
          </div>

          <div className="flex-1 min-h-[360px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            <img
              src={heightData?.colorized_height_url || '/demo_assets/demo_urban_commercial.png'}
              alt="Height Heatmap"
              className="max-h-[420px] max-w-full object-contain"
            />
          </div>

          <HeightLegend />
        </div>

        {/* Height Distribution Histogram & Calibration */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Histogram Chart */}
          <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold text-white uppercase tracking-wider">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Surface Elevation Distribution Histogram</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                10-TIER FREQUENCY
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis 
                    dataKey="height_range" 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} 
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#070B14', borderColor: '#00F0FF', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
                    itemStyle={{ color: '#00F0FF' }}
                  />
                  <Bar dataKey="percentage" name="% Frequency" radius={[4, 4, 0, 0]}>
                    {histogramData.map((_: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index < 3 ? '#0284C7' : index < 7 ? '#10B981' : '#F59E0B'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Embedded Calibration Panel */}
          <CalibrationPanel />
        </div>
      </div>
    </div>
  );
};
