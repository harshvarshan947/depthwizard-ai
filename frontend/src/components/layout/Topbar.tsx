import React from 'react';
import { 
  Sparkles, UploadCloud, Presentation, Sliders, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Topbar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    triggerLiveDemo, 
    isLoading, 
    currentResult, 
    calibration,
    presentationMode,
    setPresentationMode
  } = useApp();

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Command Center Dashboard';
      case 'upload': return 'Image Ingestion & Satellite Analysis';
      case 'depth': return 'AI Depth Map & Normalization';
      case 'height': return 'Height Estimation & Hypsometric Modeling';
      case 'reconstruction': return '3D Volumetric Mesh Reconstruction';
      case 'flythrough': return 'First-Person 6-DOF Flythrough Navigation';
      case 'objects': return 'Morphological Object & Structure Inventory';
      case 'export': return 'Geospatial Export & Reporting Suite';
      case 'settings': return 'Photogrammetric Calibration Settings';
      default: return 'DepthWizard AI Workspace';
    }
  };

  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-cyan-500/20 px-6 flex items-center justify-between shrink-0 select-none z-20">
      
      {/* Title & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <div>
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
            PARALLAX // GEOSPATIAL INTELLIGENCE
          </div>
          <h2 className="text-sm font-mono font-bold text-white tracking-wide">
            {getPageTitle()}
          </h2>
        </div>

        {/* Calibration Badge */}
        <div className="hidden md:flex items-center ml-4">
          {calibration.is_calibrated ? (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
              <ShieldCheck className="w-3 h-3" />
              <span>METRIC CALIBRATED ({calibration.ground_sampling_distance_cm}cm GSD)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
              <AlertCircle className="w-3 h-3" />
              <span>RELATIVE DEPTH (UNCALIBRATED)</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        {/* Upload Button */}
        <button
          onClick={() => setActiveTab('upload')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 text-xs font-mono text-slate-200 transition"
        >
          <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>Upload Image</span>
        </button>

        {/* Calibration Quick Toggle */}
        <button
          onClick={() => setActiveTab('settings')}
          title="Adjust Altitude, GSD & Reference Height"
          className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white transition"
        >
          <Sliders className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Try Live Demo Button (Featured prominently for SIH judges) */}
        <button
          onClick={() => triggerLiveDemo('demo_urban_commercial')}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs font-mono shadow-glow-cyan transition-all transform hover:scale-[1.02] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 fill-navy-950" />
          <span>{isLoading ? 'PROCESSING...' : 'TRY LIVE DEMO'}</span>
        </button>

        {/* Presentation Mode Toggle */}
        <button
          onClick={() => setPresentationMode(!presentationMode)}
          title="SIH Stage Presentation Mode (Hotkey: P)"
          className={`p-2 rounded-lg border transition ${
            presentationMode
              ? 'bg-amber-500 border-amber-400 text-navy-950'
              : 'border-slate-700 text-slate-300 hover:text-white bg-slate-800/50'
          }`}
        >
          <Presentation className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
