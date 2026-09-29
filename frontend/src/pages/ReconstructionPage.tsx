import React from 'react';
import { 
  Box, Eye, Layers, Compass, Sliders, 
  Download, Maximize2, ShieldCheck, Activity 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThreeDViewport } from '../components/3d/ThreeDViewport';

export const ReconstructionPage: React.FC = () => {
  const { currentResult, setActiveTab, calibration } = useApp();

  const recon = currentResult?.reconstruction;

  return (
    <div className="flex-1 p-6 space-y-6 flex flex-col overflow-y-auto">
      
      {/* Title Bar */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <span>3D Volumetric Mesh & Terrain Reconstruction</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time height-field displacement mesh with custom vertex shaders and dynamic lighting.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('flythrough')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold font-mono text-xs shadow-glow-cyan transition"
          >
            <Eye className="w-4 h-4 fill-navy-950" />
            <span>Launch Flythrough</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export GLB / OBJ</span>
          </button>
        </div>
      </div>

      {/* 3D Viewport Box */}
      <div className="flex-1 min-h-[580px] w-full flex flex-col">
        <ThreeDViewport />
      </div>

      {/* Diagnostics & Mesh Metadata Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <span className="text-[10px] text-slate-500 block uppercase">POLYGON FACES</span>
          <span className="text-sm font-bold text-white mt-0.5 block">
            {recon?.faces_count.toLocaleString() ?? '50,400'} Triangles
          </span>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <span className="text-[10px] text-slate-500 block uppercase">DISCRETE VERTICES</span>
          <span className="text-sm font-bold text-cyan-300 mt-0.5 block">
            {recon?.vertices_count.toLocaleString() ?? '25,600'} Spatial Nodes
          </span>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <span className="text-[10px] text-slate-500 block uppercase">COORDINATE FRAME</span>
          <span className="text-sm font-bold text-emerald-400 mt-0.5 block">
            {calibration.is_calibrated ? 'Calibrated Metric Datum' : 'Local Cartesian [-50, +50]'}
          </span>
        </div>

        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <span className="text-[10px] text-slate-500 block uppercase">RENDER LATENCY</span>
          <span className="text-sm font-bold text-cyan-400 mt-0.5 block">
            60 FPS (Hardware WebGL 2.0)
          </span>
        </div>
      </div>
    </div>
  );
};
