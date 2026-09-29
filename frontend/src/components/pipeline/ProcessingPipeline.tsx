import React from 'react';
import { 
  CheckCircle2, Loader2, Sparkles, Layers, Mountain, 
  Target, Box, Activity, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ProcessingPipeline: React.FC = () => {
  const { isLoading, pipelineStep, pipelineProgress, pipelineStatusText } = useApp();

  if (!isLoading) return null;

  const steps = [
    { num: 1, title: 'Image Preprocessing', desc: 'Resizing, multi-band normalisation & radiance adjustment' },
    { num: 2, title: 'AI Depth Estimation', desc: 'Depth Anything V2 monocular foundation model inference' },
    { num: 3, title: 'Depth Normalization', desc: 'Gradient curve calibration & shadow caster separation' },
    { num: 4, title: 'Height Reconstruction', desc: 'Ground-plane estimation & photogrammetric elevation mapping' },
    { num: 5, title: 'Object Analysis', desc: 'Morphological clustering & 3D structure footprint inventory' },
    { num: 6, title: '3D Mesh Generation', desc: 'Constructing high-density terrain vertex & normal buffers' },
    { num: 7, title: 'Scene Optimization', desc: 'LOD buffering, lighting configuration & WebGL setup' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-navy-900 border border-cyan-500/40 rounded-2xl p-7 max-w-xl w-full shadow-2xl shadow-cyan-500/10 relative overflow-hidden">
        
        {/* Subtle background radar scan effect */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-mono font-bold text-white flex items-center space-x-2">
                <span>AI RECONSTRUCTION PIPELINE</span>
              </h3>
              <div className="text-xs font-mono text-cyan-400/80">
                TEAM PARALLAX // SINGLE-VIEW RECONSTRUCTION
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-black text-cyan-400">
              {pipelineProgress}%
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              PROCESSING
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 mb-6 p-0.5 border border-slate-800 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyber-cyan h-full rounded-full transition-all duration-300 shadow-glow-cyan"
            style={{ width: `${pipelineProgress}%` }}
          />
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {steps.map((st) => {
            const isCompleted = pipelineStep > st.num;
            const isCurrent = pipelineStep === st.num;

            return (
              <div 
                key={st.num}
                className={`flex items-start space-x-3 p-2.5 rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200' 
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/20 text-slate-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono text-slate-600">
                      {st.num}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wide">
                      STEP 0{st.num}: {st.title}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold animate-pulse">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {st.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status text footer */}
        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center space-x-2 text-xs font-mono text-cyan-300">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">{pipelineStatusText}</span>
        </div>
      </div>
    </div>
  );
};
