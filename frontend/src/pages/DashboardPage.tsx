import React from 'react';
import { 
  Sparkles, UploadCloud, Layers, Mountain, 
  Target, Cpu, Clock, Maximize, Activity, ShieldCheck, 
  AlertCircle, ChevronRight, Eye, Download, Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ObjectItem } from '../types';
import { ThreeDViewport } from '../components/3d/ThreeDViewport';
import { HeightLegend } from '../components/common/HeightLegend';

export const DashboardPage: React.FC = () => {
  const { 
    currentResult, 
    triggerLiveDemo, 
    isLoading, 
    setActiveTab, 
    calibration,
    setSelectedObjectId
  } = useApp();

  const isProcessed = !!currentResult;

  // Stats values: show "--" before processing as strictly required by Section 4
  const resLabel = isProcessed 
    ? `${currentResult.dimensions[0]} × ${currentResult.dimensions[1]} px` 
    : '--';
  const timeLabel = isProcessed 
    ? `${currentResult.pipeline_duration_ms.toFixed(0)} ms` 
    : '--';
  const objectsCount = isProcessed 
    ? String(currentResult.objects.total_detected) 
    : '--';
  const unit = currentResult?.height?.unit || 'rel-units';
  const maxHeight = isProcessed 
    ? `${currentResult.height.max_height} ${unit}` 
    : '--';
  const avgHeight = isProcessed 
    ? `${currentResult.height.average_height} ${unit}` 
    : '--';
  const confidenceLabel = isProcessed 
    ? `${(currentResult.depth.confidence * 100).toFixed(0)}%` 
    : '--';

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto">
      
      {/* Dashboard Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest flex items-center space-x-2">
            <span>PARALLAX COMMAND CENTER</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-2xl font-mono font-black text-white mt-1">
            DEPTHWIZARD AI
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Single-View Height Estimation & 3D Flythrough
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('upload')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-200 transition"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => triggerLiveDemo('demo_urban_commercial')}
            disabled={isLoading}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-mono text-xs font-black shadow-glow-cyan transition-all transform hover:scale-[1.02] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 fill-navy-950" />
            <span>{isLoading ? 'RUNNING PIPELINE...' : 'TRY DEMO'}</span>
          </button>
        </div>
      </div>

      {/* Six Metric Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* 1. Image Resolution */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            IMAGE RESOLUTION
          </div>
          <div className="text-base font-mono font-bold text-white mt-1">
            {resLabel}
          </div>
          <div className="text-[10px] font-mono text-cyan-400/80 mt-1">
            {isProcessed ? 'Sensor Dimension' : 'No Input Ingested'}
          </div>
        </div>

        {/* 2. Processing Time */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            PROCESSING TIME
          </div>
          <div className="text-base font-mono font-bold text-cyan-300 mt-1">
            {timeLabel}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            7-Stage Pipeline
          </div>
        </div>

        {/* 3. Objects Detected */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            OBJECTS DETECTED
          </div>
          <div className="text-base font-mono font-bold text-amber-300 mt-1">
            {objectsCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Structures Segmented
          </div>
        </div>

        {/* 4. Max Estimated Height */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            MAX ESTIMATED HEIGHT
          </div>
          <div className="text-base font-mono font-bold text-rose-400 mt-1 truncate">
            {maxHeight}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            Peak Surface Point
          </div>
        </div>

        {/* 5. Average Height */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            AVERAGE HEIGHT
          </div>
          <div className="text-base font-mono font-bold text-emerald-400 mt-1 truncate">
            {avgHeight}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1">
            Mean Surface Level
          </div>
        </div>

        {/* 6. Model Confidence */}
        <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3.5 shadow-glass">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            MODEL CONFIDENCE
          </div>
          <div className="text-base font-mono font-bold text-cyan-400 mt-1">
            {confidenceLabel}
          </div>
          <div className="text-[10px] font-mono text-slate-500 mt-1 truncate">
            {isProcessed ? currentResult.depth.model_name.split(' ')[0] : 'Inference Standby'}
          </div>
        </div>
      </div>

      {/* Main Workspace Split: Large 3D Viewport on Left, Analysis Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[580px]">
        
        {/* Left 3/4: Large Interactive 3D Preview */}
        <div className="lg:col-span-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-bold text-white uppercase tracking-wider">
                INTERACTIVE 3D TERRAIN RECONSTRUCTION
              </span>
            </div>
            <div className="text-xs font-mono text-slate-400">
              Controls: Click + Drag to rotate | Scroll to Zoom | Click objects to inspect
            </div>
          </div>

          <div className="flex-1 w-full min-h-[500px]">
            <ThreeDViewport />
          </div>
        </div>

        {/* Right 1/4: Analysis Summary Panel */}
        <div className="lg:col-span-1 flex flex-col space-y-4">
          
          {/* Elevation Scale Legend */}
          <HeightLegend />

          {/* Analysis Summary Card */}
          <div className="bg-navy-900/90 border border-cyan-500/20 rounded-xl p-4 shadow-glass flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 pb-2.5 border-b border-slate-800 mb-3">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Analysis Summary
                </h3>
              </div>

              {isProcessed ? (
                <div className="space-y-3 text-xs font-mono">
                  <div>
                    <span className="text-[11px] text-slate-400">IMAGE ASSET</span>
                    <div className="text-slate-200 font-bold truncate mt-0.5">
                      {currentResult.filename}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">DEPTH ENGINE</span>
                    <div className="text-cyan-300 font-semibold mt-0.5">
                      {currentResult.depth.model_name}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400">CALIBRATION DISCLOSURE</span>
                    <div className="mt-1">
                      {calibration.is_calibrated ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px]">
                          Calibrated ({calibration.ground_sampling_distance_cm} cm GSD)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
                          Relative Height Estimate
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top Detected Structures */}
                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[11px] text-slate-400 mb-2 block">
                      DETECTED STRUCTURES ({currentResult.objects.total_detected})
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {currentResult.objects.objects.slice(0, 5).map((obj: ObjectItem) => (
                        <div
                          key={obj.id}
                          onClick={() => setSelectedObjectId(obj.id)}
                          className="p-2 rounded-lg bg-slate-950/60 hover:bg-cyan-950/30 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-200 text-[11px]">
                              {obj.id}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {obj.category}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-cyan-400 font-bold text-[11px]">
                              {obj.estimated_height} {obj.height_unit}
                            </div>
                            <div className="text-[9px] text-slate-500">
                              {(obj.confidence * 100).toFixed(0)}% conf
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-mono text-xs">
                  <AlertCircle className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                  <p>No image analyzed yet.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Click "Try Demo" or "Upload Image" to initiate the pipeline.
                  </p>
                </div>
              )}
            </div>

              {isProcessed && (
              <div className="pt-3 border-t border-slate-800 mt-3 space-y-2">
                <button
                  onClick={() => setActiveTab('flythrough')}
                  className="w-full py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-bold rounded-lg flex items-center justify-center space-x-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Enter Flythrough Mode</span>
                </button>

                <button
                  onClick={() => setActiveTab('export')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export 3D Mesh & Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
