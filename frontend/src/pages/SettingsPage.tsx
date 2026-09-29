import React from 'react';
import { 
  Sliders, Cpu, ShieldCheck, Database, HardDrive, 
  CheckCircle2, Info, BookOpen 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalibrationPanel } from '../components/common/CalibrationPanel';

export const SettingsPage: React.FC = () => {
  const { systemHealth } = useApp();

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Title */}
      <div className="pb-4 border-b border-cyan-500/20">
        <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Photogrammetric Calibration</span>
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Configure sensor altitude, GSD photogrammetry parameters, AI model engines, and storage paths.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Calibration Panel */}
        <div>
          <CalibrationPanel />
        </div>

        {/* Right Column: AI Model Diagnostics & Photogrammetric Reference */}
        <div className="space-y-6">
          
          {/* AI Model Architecture Card */}
          <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass space-y-3 font-mono text-xs">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800 text-white font-bold uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>AI Engine Configuration</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">PRIMARY FOUNDATION MODEL:</span>
                <span className="text-cyan-300 font-bold">Depth Anything V2 (ViT-Small)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">SCIENTIFIC FALLBACK ENGINE:</span>
                <span className="text-slate-200">DepthWizard Aerial Spatial Estimator</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-500">HARDWARE ACCELERATION:</span>
                <span className="text-emerald-400 font-semibold">WebGL 2.0 GPU Shader Buffers</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">STATUS:</span>
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ONLINE & READY</span>
                </span>
              </div>
            </div>
          </div>

          {/* Photogrammetric Equations Reference Card */}
          <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass space-y-3 text-xs">
            <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800 text-white font-mono font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Mathematical Calibration Foundations</span>
            </div>

            <p className="text-slate-400 leading-relaxed font-sans">
              DepthWizard AI computes absolute building heights \(H\) from monocular relative depth \(\Delta d\) and sensor Ground Sampling Distance (GSD):
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-cyan-300 text-center text-xs">
              {'H = (H_ref / Δd_ref) · Δd_obj   OR   H ≈ A_sensor · [Δd / (1 + Δd)]'}
            </div>

            <p className="text-slate-500 text-[11px] font-sans">
              Where A_sensor is the calibrated flight altitude, H_ref is a ground anchor landmark, and Δd is the relative depth disparity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
