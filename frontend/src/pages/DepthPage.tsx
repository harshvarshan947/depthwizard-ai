import React from 'react';
import { 
  Layers, Sliders, RefreshCw, Eye, Sparkles, 
  ArrowRight, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const DepthPage: React.FC = () => {
  const { 
    currentResult, 
    setCurrentResult,
    depthContrast, 
    setDepthContrast, 
    depthScale, 
    setDepthScale, 
    invertDepth, 
    setInvertDepth,
    selectedColormap,
    setSelectedColormap,
    isLoading
  } = useApp();

  const handleUpdateDepthSettings = async () => {
    if (!currentResult) return;
    try {
      const depthRes = await api.estimateDepth({
        image_id: currentResult.image_id,
        contrast: depthContrast,
        scale: depthScale,
        invert: invertDepth,
        colormap: selectedColormap,
        use_ai_model: true
      });
      setCurrentResult({
        ...currentResult,
        depth: depthRes
      });
    } catch (err) {
      console.error('Error updating depth:', err);
    }
  };

  const colormaps = [
    { id: 'turbo', label: 'Turbo (Spectral)' },
    { id: 'viridis', label: 'Viridis (Perceptual)' },
    { id: 'inferno', label: 'Inferno (Thermal)' },
    { id: 'magma', label: 'Magma (High-Contrast)' },
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Title */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>AI Depth Map & Normalization Engine</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Foundation model monocular depth estimation powered by Depth Anything V2.
          </p>
        </div>

        {/* Model Status Pill */}
        <div className="flex items-center space-x-2 bg-navy-900 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{currentResult?.depth?.model_name || 'Depth Anything V2'}</span>
        </div>
      </div>

      {/* Main Comparative Viewport: Original Image -> Depth Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Original Input Image */}
        <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
            <span className="font-bold text-slate-300 uppercase tracking-wider">
              ORIGINAL AERIAL SENSOR IMAGE
            </span>
            <span className="text-slate-500">
              {currentResult ? `${currentResult.dimensions[0]}×${currentResult.dimensions[1]} px` : '768×768 px'}
            </span>
          </div>
          <div className="flex-1 min-h-[380px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            <img
              src={currentResult?.image_url || '/demo_assets/demo_urban_commercial.png'}
              alt="Original Aerial"
              className="max-h-[440px] max-w-full object-contain"
            />
          </div>
        </div>

        {/* AI Depth Map Prediction */}
        <div className="bg-navy-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-glass flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs font-mono">
            <span className="font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5">
              <span>COLORIZED RELATIVE DEPTH FIELD</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400">
                NORMALIZED
              </span>
            </span>
            <span className="text-cyan-400 font-semibold">
              Confidence: {((currentResult?.depth?.confidence || 0.94) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex-1 min-h-[380px] bg-black rounded-xl overflow-hidden flex items-center justify-center border border-cyan-500/30 shadow-glow-cyan">
            <img
              src={currentResult?.depth?.colorized_depth_url || '/demo_assets/demo_urban_commercial.png'}
              alt="Colorized Depth Map"
              className="max-h-[440px] max-w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Depth Filter & Post-Processing Controls */}
      <div className="bg-navy-900/90 border border-cyan-500/20 rounded-2xl p-6 shadow-glass space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-xs font-mono font-bold text-white uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Interactive Depth Post-Processing Controls</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs font-mono">
          
          {/* Contrast Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-400">DEPTH CONTRAST</span>
              <span className="text-cyan-300 font-bold">{depthContrast.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.05"
              value={depthContrast}
              onChange={(e) => setDepthContrast(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Scale Slider */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-slate-400">DEPTH SCALE</span>
              <span className="text-cyan-300 font-bold">{depthScale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={depthScale}
              onChange={(e) => setDepthScale(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Colormap Selector */}
          <div>
            <span className="block text-slate-400 mb-1.5">COLORMAP PALETTE</span>
            <select
              value={selectedColormap}
              onChange={(e) => setSelectedColormap(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-white cursor-pointer focus:border-cyan-400"
            >
              {colormaps.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Invert Depth & Recalculate */}
          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={invertDepth}
                onChange={(e) => setInvertDepth(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded"
              />
              <span className="text-slate-300">Invert Depth Polarity</span>
            </label>

            <button
              onClick={handleUpdateDepthSettings}
              disabled={isLoading || !currentResult}
              className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Update Depth Map</span>
            </button>
          </div>
        </div>

        {/* Scientific disclosure footer */}
        <div className="pt-3 border-t border-slate-800 text-[11px] font-sans text-slate-400 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Notice:</strong> Monocular neural depth estimation represents affine-invariant relative depth. Closer or taller structures exhibit brighter values; ground baseline represents lower elevation values.
          </span>
        </div>
      </div>
    </div>
  );
};
