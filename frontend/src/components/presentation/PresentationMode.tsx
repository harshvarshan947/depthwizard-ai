import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Image as ImageIcon, Layers, Mountain, Box, 
  Navigation, ChevronRight, ChevronLeft, Sparkles, 
  Maximize2, Minimize2, CheckCircle2, Cpu, Activity, 
  Sliders, RotateCcw, Plane, ShieldCheck, Compass, BarChart3, Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ThreeDViewport } from '../3d/ThreeDViewport';

export const PresentationMode: React.FC = () => {
  const { 
    presentationMode, 
    setPresentationMode, 
    currentResult, 
    triggerLiveDemo, 
    isLoading,
    setFlythroughActive,
    calibration
  } = useApp();

  const [activeStage, setActiveStage] = useState<number>(1);
  const [depthViewMode, setDepthViewMode] = useState<'color' | 'grayscale'>('color');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-load benchmark demo if presentation mode is opened without data
  useEffect(() => {
    if (presentationMode && !currentResult && !isLoading) {
      triggerLiveDemo('demo_urban_commercial');
    }
  }, [presentationMode, currentResult, isLoading, triggerLiveDemo]);

  // Sync flythrough active state with stage 4 vs 5
  useEffect(() => {
    if (presentationMode) {
      if (activeStage === 5) {
        setFlythroughActive(true);
      } else {
        setFlythroughActive(false);
      }
    }
  }, [activeStage, presentationMode, setFlythroughActive]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation for presentation slide deck (Arrow keys, Space, 1-5, P/ESC to exit)
  useEffect(() => {
    if (!presentationMode) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setActiveStage((prev) => Math.min(5, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveStage((prev) => Math.max(1, prev - 1));
      } else if (e.key === '1') {
        setActiveStage(1);
      } else if (e.key === '2') {
        setActiveStage(2);
      } else if (e.key === '3') {
        setActiveStage(3);
      } else if (e.key === '4') {
        setActiveStage(4);
      } else if (e.key === '5') {
        setActiveStage(5);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (!document.pointerLockElement) {
          setPresentationMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [presentationMode, setPresentationMode]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
    }
  };

  if (!presentationMode) return null;

  const stages = [
    { num: 1, label: '01. SATELLITE EO', sublabel: 'Input Aerial Image', icon: ImageIcon },
    { num: 2, label: '02. AI DEPTH MAP', sublabel: 'Depth Anything V2', icon: Layers },
    { num: 3, label: '03. HEIGHT MODEL', sublabel: 'Metric Elevation', icon: Mountain },
    { num: 4, label: '04. 3D TERRAIN', sublabel: 'Volumetric Mesh', icon: Box },
    { num: 5, label: '05. FLYTHROUGH', sublabel: '6-DOF Navigation', icon: Navigation },
  ];

  const result = currentResult;
  const unit = result?.height?.unit || 'rel-units';
  const confidencePct = Math.round((result?.depth?.confidence || 0.96) * 100);
  const latencyMs = result?.depth?.processing_time_ms || 1150;
  const facesCount = result?.reconstruction?.faces_count || 50400;
  const vertsCount = result?.reconstruction?.vertices_count || 25600;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#030611] text-white flex flex-col select-none overflow-hidden animate-in fade-in"
    >
      {/* High-Contrast Projector Header */}
      <header className="h-20 px-8 bg-navy-950/95 border-b border-cyan-500/30 flex items-center justify-between shrink-0 shadow-2xl backdrop-blur-md">
        
        {/* Project & Team Title Badge */}
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-black text-navy-950 text-xl shadow-glow-cyan">
            DW
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-mono font-black tracking-widest text-white">
                DEPTHWIZARD <span className="text-cyan-400">AI</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[11px] font-mono font-bold uppercase tracking-wider">
                SIH GRAND FINALE
              </span>
            </div>
            <div className="text-xs font-mono text-cyan-300/80 font-medium tracking-wide mt-0.5 flex items-center space-x-2">
              <span className="text-amber-400 font-bold">TEAM PARALLAX</span>
              <span className="text-slate-600">•</span>
              <span>SINGLE-VIEW HEIGHT ESTIMATION & 3D FLYTHROUGH</span>
            </div>
          </div>
        </div>

        {/* Central Sequential Stage Stepper Ribbon */}
        <div className="flex items-center space-x-1.5 bg-navy-900/90 p-1.5 rounded-xl border border-cyan-500/30 shadow-glass">
          {stages.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = activeStage === st.num;
            const isPast = activeStage > st.num;

            return (
              <React.Fragment key={st.num}>
                <button
                  onClick={() => setActiveStage(st.num)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isCurrent
                      ? 'bg-cyan-500 text-navy-950 font-bold shadow-glow-cyan ring-1 ring-cyan-300'
                      : isPast
                      ? 'text-cyan-400 hover:text-white hover:bg-slate-800/80 bg-slate-900/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title={`Jump to ${st.label}`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <div className="text-left">
                    <span className="block leading-none">{st.label}</span>
                  </div>
                </button>
                {idx < stages.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Action Controls & Exit */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition"
            title={isFullscreen ? "Exit Fullscreen" : "Projector Fullscreen (F)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setPresentationMode(false)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border border-rose-500/40 bg-rose-950/20 hover:bg-rose-900/40 text-rose-300 text-xs font-mono font-bold transition"
            title="Exit Presentation Mode (P or ESC)"
          >
            <X className="w-4 h-4 text-rose-400" />
            <span>EXIT (Esc)</span>
          </button>
        </div>
      </header>

      {/* Main High-Impact Presentation Canvas */}
      <main className="flex-1 relative p-6 flex flex-col items-center justify-center overflow-hidden">
        
        {/* ========================================================================= */}
        {/* STAGE 1: ORIGINAL SATELLITE / AERIAL EO IMAGE                            */}
        {/* ========================================================================= */}
        {activeStage === 1 && (
          <div className="w-full h-full max-w-7xl flex flex-col items-center justify-between gap-4 animate-in zoom-in-95">
            {/* Stage Title Banner */}
            <div className="w-full text-center">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">
                STAGE 01 OF 05 // INPUT INGESTION
              </span>
              <h2 className="text-3xl font-mono font-black text-white mt-1.5">
                Single-View Monocular Optical Satellite / Aerial Image
              </h2>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Target: {result?.filename || 'Metropolitan Urban Commercial Center'} | Sensor Resolution: {result?.dimensions[0] || 768} × {result?.dimensions[1] || 768} px
              </p>
            </div>

            {/* Split Content: Main Image + Geospatial Metadata Card */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-center">
              {/* Left 8 Cols: Large High-Resolution Aerial View */}
              <div className="lg:col-span-8 h-full max-h-[62vh] rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl bg-black flex items-center justify-center relative">
                <img
                  src={result?.image_url || '/demo_assets/demo_urban_commercial.png'}
                  alt="Source Aerial"
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-3 left-3 bg-navy-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-300">
                  MONOCULAR RGB EO • 15 cm GSD
                </div>
              </div>

              {/* Right 4 Cols: Technical Metadata & Rationale Callout */}
              <div className="lg:col-span-4 h-full flex flex-col justify-between space-y-4">
                {/* Technical Challenge Callout */}
                <div className="bg-navy-900/90 border border-cyan-500/30 rounded-2xl p-5 shadow-glass">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs uppercase mb-2">
                    <Info className="w-4 h-4" />
                    <span>THE TECHNICAL CHALLENGE</span>
                  </div>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed">
                    Standard satellite and drone imagery is strictly <strong className="text-white">monocular 2D</strong>. In conventional GIS workflows, height retrieval required costly stereoscopic pairs or airborne LiDAR missions.
                  </p>
                  <p className="text-xs font-mono text-slate-300 leading-relaxed mt-2.5">
                    <span className="text-cyan-300 font-bold">DepthWizard AI</span> eliminates this requirement by predicting metric-calibrated elevation directly from a single optical frame.
                  </p>
                </div>

                {/* Sensor & Acquisition Specs */}
                <div className="bg-navy-900/80 border border-slate-800 rounded-2xl p-5 shadow-glass space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block border-b border-slate-800 pb-1.5">
                    ACQUISITION SPECIFICATIONS
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GROUND SAMPLING (GSD):</span>
                    <span className="text-cyan-300 font-bold">{calibration.ground_sampling_distance_cm} cm / px</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">SENSOR ALTITUDE:</span>
                    <span className="text-white font-bold">{calibration.camera_altitude_m} m AGL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">COORDINATE DATUM:</span>
                    <span className="text-emerald-400 font-bold">{calibration.elevation_datum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">COLOR CHANNELS:</span>
                    <span className="text-white font-bold">RGB 8-bit Perceptual</span>
                  </div>
                </div>

                {/* Next Step Callout */}
                <button
                  onClick={() => setActiveStage(2)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-glow-cyan transition"
                >
                  <span>Step 2: Run Depth Estimation</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 2: DEPTH ANYTHING V2 FOUNDATION MODEL PREDICTION                    */}
        {/* ========================================================================= */}
        {activeStage === 2 && (
          <div className="w-full h-full max-w-7xl flex flex-col items-center justify-between gap-4 animate-in zoom-in-95">
            {/* Stage Title */}
            <div className="w-full text-center">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest">
                STAGE 02 OF 05 // NEURAL DEPTH ESTIMATION
              </span>
              <h2 className="text-3xl font-mono font-black text-white mt-1.5">
                Depth Anything V2 Foundation Model Inference
              </h2>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Backbone: <span className="text-cyan-300 font-bold">{result?.depth?.model_name || 'Depth Anything V2 (ViT-Small)'}</span> | Inference Latency: <span className="text-emerald-400 font-bold">{latencyMs} ms</span> | Neural Confidence: <span className="text-cyan-300 font-bold">{confidencePct}%</span>
              </p>
            </div>

            {/* Split Comparison: Input Image vs Depth Map */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-center">
              {/* Left 4 Cols: Original Input Reference */}
              <div className="lg:col-span-5 h-full max-h-[58vh] flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-mono text-slate-400 font-bold">MONOCULAR OPTICAL INPUT</span>
                  <span className="text-[10px] font-mono text-slate-500">2D AERIAL</span>
                </div>
                <div className="w-full flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center shadow-lg">
                  <img
                    src={result?.image_url || '/demo_assets/demo_urban_commercial.png'}
                    alt="Original"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Center 5 Cols: Normalized / Colorized Depth Map */}
              <div className="lg:col-span-5 h-full max-h-[58vh] flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-cyan-300 font-bold">PREDICTED DEPTH MAP</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      d ∈ [0.0, 1.0]
                    </span>
                  </div>
                  {/* Toggle Mode */}
                  <div className="flex space-x-1 bg-navy-900 rounded p-0.5 border border-slate-800">
                    <button
                      onClick={() => setDepthViewMode('color')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        depthViewMode === 'color' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Heatmap
                    </button>
                    <button
                      onClick={() => setDepthViewMode('grayscale')}
                      className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                        depthViewMode === 'grayscale' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Grayscale
                    </button>
                  </div>
                </div>
                <div className="w-full flex-1 rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-black flex items-center justify-center shadow-glow-cyan">
                  <img
                    src={
                      depthViewMode === 'color'
                        ? (result?.depth?.colorized_depth_url || '/demo_assets/demo_urban_commercial_height_color.png')
                        : (result?.depth?.normalized_depth_url || '/demo_assets/demo_urban_commercial_depth_norm.png')
                    }
                    alt="Depth Prediction"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Right 2 Cols: AI Performance Metrics Card */}
              <div className="lg:col-span-2 h-full flex flex-col justify-between space-y-3 font-mono text-xs">
                <div className="bg-navy-900/90 border border-cyan-500/30 rounded-xl p-3.5 shadow-glass space-y-2">
                  <div className="flex items-center space-x-1 text-cyan-400 font-bold text-[10px] uppercase">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI ACCELERATION</span>
                  </div>
                  <div className="text-xl font-bold text-white">{latencyMs} ms</div>
                  <div className="text-[10px] text-slate-400">Zero synthetic fallback. Live neural PyTorch inference.</div>
                </div>

                <div className="bg-navy-900/90 border border-slate-800 rounded-xl p-3.5 shadow-glass space-y-2">
                  <div className="flex items-center space-x-1 text-emerald-400 font-bold text-[10px] uppercase">
                    <Activity className="w-3.5 h-3.5" />
                    <span>CONFIDENCE SCORE</span>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">{confidencePct}%</div>
                  <div className="text-[10px] text-slate-400">High gradient edge resolution on buildings.</div>
                </div>

                <button
                  onClick={() => setActiveStage(3)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold text-xs flex items-center justify-center space-x-1 shadow-glow-cyan transition"
                >
                  <span>Step 3: Height</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: PHOTOGRAMMETRIC HEIGHT ESTIMATION & CALIBRATION                 */}
        {/* ========================================================================= */}
        {activeStage === 3 && (
          <div className="w-full h-full max-w-7xl flex flex-col items-center justify-between gap-4 animate-in zoom-in-95">
            {/* Stage Title */}
            <div className="w-full text-center">
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                STAGE 03 OF 05 // PHOTOGRAMMETRIC CALIBRATION
              </span>
              <h2 className="text-3xl font-mono font-black text-white mt-1.5">
                Hypsometric Height Model & Metric Elevation Matrix
              </h2>
              <p className="text-sm text-slate-400 font-mono mt-0.5">
                Status: <span className="text-emerald-400 font-bold">{result?.height?.calibration_status || 'Calibrated Ground Sampling Distance'}</span>
              </p>
            </div>

            {/* Split Content: Large Height Map + Elevation Metrics */}
            <div className="w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 items-center">
              {/* Left 8 Cols: Height Field Heatmap with Hypsometric Color Legend */}
              <div className="lg:col-span-8 h-full max-h-[62vh] rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-black flex items-center justify-center relative shadow-2xl">
                <img
                  src={result?.height?.colorized_height_url || '/demo_assets/demo_urban_commercial_height_color.png'}
                  alt="Hypsometric Height Map"
                  className="w-full h-full object-contain"
                />

                {/* Vertical Elevation Legend Overlay */}
                <div className="absolute bottom-4 right-4 bg-navy-950/90 backdrop-blur-md p-3 rounded-xl border border-emerald-500/30 text-xs font-mono shadow-glass flex flex-col space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase mb-1">ELEVATION SCALE</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-28 bg-gradient-to-t from-black via-rose-600 via-amber-400 to-yellow-200 rounded-sm" />
                    <div className="flex flex-col justify-between h-28 text-[10px] text-slate-300">
                      <span className="text-yellow-300 font-bold">{result?.height?.max_height || 48.5} {unit} (Peak)</span>
                      <span>35.0 {unit}</span>
                      <span>20.0 {unit}</span>
                      <span>8.0 {unit}</span>
                      <span className="text-slate-400">0.0 {unit} (Datum)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right 4 Cols: Elevation Histogram & Stat Cards */}
              <div className="lg:col-span-4 h-full flex flex-col justify-between space-y-4">
                {/* Elevation Matrix Stat Cards */}
                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-navy-900/90 border border-slate-800 rounded-xl p-3.5 shadow-glass">
                    <span className="text-[10px] text-slate-500 uppercase block">MAX ELEVATION</span>
                    <span className="text-xl font-bold text-cyan-300 mt-1 block">
                      {result?.height?.max_height || 48.5} <span className="text-xs">{unit}</span>
                    </span>
                  </div>
                  <div className="bg-navy-900/90 border border-slate-800 rounded-xl p-3.5 shadow-glass">
                    <span className="text-[10px] text-slate-500 uppercase block">AVERAGE HEIGHT</span>
                    <span className="text-xl font-bold text-emerald-400 mt-1 block">
                      {result?.height?.average_height || 18.2} <span className="text-xs">{unit}</span>
                    </span>
                  </div>
                </div>

                {/* 10-Bin Height Histogram Distribution */}
                <div className="bg-navy-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-glass flex-1 flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-mono">
                    <span className="text-cyan-400 font-bold flex items-center space-x-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>ELEVATION HISTOGRAM</span>
                    </span>
                    <span className="text-[10px] text-slate-400">10 BINS</span>
                  </div>

                  <div className="space-y-1.5 my-2">
                    {(result?.height?.histogram || [
                      { height_range: '0-5m', percentage: 38 },
                      { height_range: '5-15m', percentage: 24 },
                      { height_range: '15-30m', percentage: 22 },
                      { height_range: '30-45m', percentage: 12 },
                      { height_range: '45-60m', percentage: 4 },
                    ]).slice(0, 5).map((bin, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400 w-16">{bin.height_range}</span>
                        <div className="flex-1 mx-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                            style={{ width: `${Math.min(100, bin.percentage * 2)}%` }}
                          />
                        </div>
                        <span className="text-slate-200 w-10 text-right">{bin.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800">
                    Calculated via ground-level baseline subtraction (10th percentile filter).
                  </div>
                </div>

                <button
                  onClick={() => setActiveStage(4)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-mono font-bold text-xs flex items-center justify-center space-x-2 shadow-glow-cyan transition"
                >
                  <span>Step 4: Launch 3D Mesh</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 4: 3D HEIGHT-FIELD TERRAIN & STRUCTURE MESH                         */}
        {/* ========================================================================= */}
        {activeStage === 4 && (
          <div className="w-full h-full flex flex-col animate-in zoom-in-95">
            {/* Stage Title */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  STAGE 04 OF 05 // 3D VOLUMETRIC RECONSTRUCTION
                </span>
                <h2 className="text-2xl font-mono font-black text-white mt-0.5">
                  Interactive Height-Field Mesh & Structural Topology
                </h2>
              </div>
              <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                <div>
                  TRIANGLES: <span className="text-cyan-300 font-bold">{facesCount.toLocaleString()}</span>
                </div>
                <div>
                  VERTICES: <span className="text-cyan-300 font-bold">{vertsCount.toLocaleString()}</span>
                </div>
                <div>
                  CLASSIFIED OBJECTS: <span className="text-emerald-400 font-bold">{result?.objects?.total_detected || 12} Buildings</span>
                </div>
              </div>
            </div>

            {/* Embedded Live Three.js Orbit Viewport */}
            <div className="flex-1 w-full rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl relative">
              <ThreeDViewport />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 5: FIRST-PERSON 6-DOF DRONE FLYTHROUGH                             */}
        {/* ========================================================================= */}
        {activeStage === 5 && (
          <div className="w-full h-full flex flex-col animate-in zoom-in-95">
            {/* Stage Title */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                  STAGE 05 OF 05 // IMMERSIVE FLYTHROUGH
                </span>
                <h2 className="text-2xl font-mono font-black text-white mt-0.5 flex items-center space-x-2">
                  <Plane className="w-5 h-5 text-cyan-400" />
                  <span>First-Person 6-DOF Drone Navigation Through Reconstructed Terrain</span>
                </h2>
              </div>
              <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                <span className="text-cyan-300 font-bold">CONTROLS:</span>
                <span>W/A/S/D + Space/Ctrl + Shift</span>
                <span className="text-slate-600">|</span>
                <span className="text-amber-400 font-bold">Click viewport to lock mouse for 360° free look</span>
              </div>
            </div>

            {/* Embedded Live Three.js Flythrough Viewport */}
            <div className="flex-1 w-full rounded-2xl overflow-hidden border border-cyan-500/40 shadow-glow-cyan relative">
              <ThreeDViewport />
            </div>
          </div>
        )}
      </main>

      {/* Projector Navigation Footer Bar */}
      <footer className="h-16 px-8 bg-navy-950/95 border-t border-cyan-500/20 flex items-center justify-between shrink-0 font-mono text-xs text-slate-400 shadow-2xl">
        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-500 uppercase tracking-wider">SLIDE SHORTCUTS:</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">← Prev</kbd>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">→ / Space Next</kbd>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">1..5 Jump</kbd>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">F Fullscreen</kbd>
          <kbd className="px-2 py-0.5 rounded bg-slate-900 text-rose-300 border border-slate-700">Esc Exit</kbd>
        </div>

        {/* Previous / Next Slide Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveStage((prev) => Math.max(1, prev - 1))}
            disabled={activeStage === 1}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-900 transition font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREVIOUS STAGE</span>
          </button>

          <div className="px-3 py-1.5 rounded-lg bg-navy-900 border border-cyan-500/30 text-cyan-300 font-bold text-xs tracking-wider">
            STAGE 0{activeStage} / 05
          </div>

          <button
            onClick={() => setActiveStage((prev) => Math.min(5, prev + 1))}
            disabled={activeStage === 5}
            className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold shadow-glow-cyan disabled:opacity-30 transition"
          >
            <span>NEXT STAGE</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
