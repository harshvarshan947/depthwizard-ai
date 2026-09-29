import React from 'react';
import { useApp } from '../../context/AppContext';

export const HeightLegend: React.FC = () => {
  const { currentResult } = useApp();

  const minH = currentResult?.height?.min_height ?? 0;
  const maxH = currentResult?.height?.max_height ?? 100;
  const unit = currentResult?.height?.unit ?? 'rel-units';

  const midH = ((minH + maxH) / 2).toFixed(1);

  return (
    <div className="bg-navy-900/90 border border-cyan-500/20 rounded-xl p-3.5 shadow-glass">
      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-bold flex justify-between items-center">
        <span>ELEVATION HYPSOMETRIC SCALE</span>
        <span className="text-cyan-400 font-bold">{unit}</span>
      </div>

      {/* Vertical / Horizontal Legend Bar */}
      <div className="space-y-1.5 font-mono text-[10px]">
        {/* Color Ramp Bar */}
        <div className="w-full h-3 rounded bg-gradient-to-r from-blue-700 via-emerald-500 via-amber-400 to-rose-600 border border-slate-700 shadow-sm" />

        {/* Labels */}
        <div className="flex justify-between text-slate-300">
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-slate-400">LOW</span>
            <span className="text-cyan-300 font-bold">{minH} {unit}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-400">MED</span>
            <span className="text-amber-300 font-bold">{midH} {unit}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-slate-400">HIGH</span>
            <span className="text-rose-400 font-bold">{maxH} {unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
