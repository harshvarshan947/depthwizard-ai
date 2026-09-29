import React from 'react';
import { 
  LayoutDashboard, UploadCloud, Layers, Mountain, 
  Box, Navigation, Target, Download, Sliders, 
  Presentation, CheckCircle2, AlertTriangle, Cpu, Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    presentationMode, 
    setPresentationMode, 
    systemHealth 
  } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Image Analysis', icon: UploadCloud },
    { id: 'depth', label: 'Depth Map', icon: Layers },
    { id: 'height', label: 'Height Estimation', icon: Mountain },
    { id: 'reconstruction', label: '3D Reconstruction', icon: Box },
    { id: 'flythrough', label: 'Flythrough Mode', icon: Navigation },
    { id: 'objects', label: 'Object Analysis', icon: Target },
    { id: 'export', label: 'Export Center', icon: Download },
    { id: 'settings', label: 'Scene Calibration', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-navy-900/90 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col justify-between shrink-0 select-none z-30">
      
      {/* Branding Header */}
      <div>
        <div className="p-5 border-b border-cyan-500/20">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <Box className="w-5 h-5 text-navy-950 font-black" />
            </div>
            <div>
              <h1 className="text-base font-mono font-extrabold text-white tracking-wider flex items-center space-x-1">
                <span>DEPTHWIZARD</span>
                <span className="text-cyan-400">AI</span>
              </h1>
              <div className="text-[10px] font-mono text-cyan-400/80 tracking-widest font-semibold flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>TEAM PARALLAX</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono leading-tight">
            Single-View Height Estimation & 3D Flythrough
          </p>
        </div>

        {/* SIH Presentation Mode Launcher Button */}
        <div className="p-3">
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all ${
              presentationMode 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-navy-950 shadow-lg shadow-orange-500/20 animate-pulse'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-glow-cyan'
            }`}
          >
            <Presentation className="w-4 h-4" />
            <span>{presentationMode ? 'EXIT PRESENTATION' : 'SIH PRESENTATION MODE'}</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/10 text-cyan-300 border-l-2 border-cyan-400 font-semibold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Diagnostics & Hardware Status */}
      <div className="p-4 border-t border-slate-800/80 bg-navy-950/60 text-[11px] font-mono space-y-2">
        {/* System Status */}
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Server</span>
          </div>
          <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>ONLINE</span>
          </span>
        </div>

        {/* AI Model Status */}
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Model</span>
          </div>
          <span className="text-[10px] text-cyan-300 truncate max-w-[110px]" title="Depth Anything V2 Active">
            DepthAnythingV2
          </span>
        </div>

        {/* WebGL Status */}
        <div className="flex items-center justify-between text-slate-300">
          <div className="flex items-center space-x-1.5">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>WebGL 2.0</span>
          </div>
          <span className="text-emerald-400 font-semibold text-[10px]">
            GPU HARDWARE
          </span>
        </div>

        <div className="pt-2 text-[9px] text-slate-500 text-center border-t border-slate-800/40">
          SIH 2024–2026 Problem Statement
        </div>
      </div>
    </aside>
  );
};
