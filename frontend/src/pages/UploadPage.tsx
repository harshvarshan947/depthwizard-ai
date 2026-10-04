import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileImage, Sparkles, CheckCircle2, 
  Layers, Mountain, Target, Grid as GridIcon, Sliders, Info,
  AlertTriangle, Globe, RefreshCw, Check, Link2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, resolveApiUrl, getStoredApiUrl, setStoredApiUrl } from '../services/api';
import { DemoPreset, ObjectItem } from '../types';

const DEFAULT_DEMOS: DemoPreset[] = [
  {
    id: "demo_urban_commercial",
    title: "Metropolitan CBD & High-Rise Complex",
    description: "Dense high-rise corporate towers with rooftop helipads, multilevel structures, and sharp shadow extrusions.",
    thumbnail_url: "/demo_assets/demo_urban_commercial.png",
    type: "Aerial EO 15cm GSD",
    default_altitude: 650.0,
    default_gsd: 15.0
  },
  {
    id: "demo_suburban_quarry",
    title: "Open-Pit Topographic Quarry",
    description: "Complex stepped contour terraces, earthwork benches, excavation equipment, and gradual elevation drops.",
    thumbnail_url: "/demo_assets/demo_suburban_quarry.png",
    type: "UAV Survey 8cm GSD",
    default_altitude: 350.0,
    default_gsd: 8.0
  },
  {
    id: "demo_coastal_facility",
    title: "Coastal Petrochemical Terminal",
    description: "Cylindrical storage tanks, industrial pipelines, loading docks, and sharp land-water boundaries.",
    thumbnail_url: "/demo_assets/demo_coastal_facility.png",
    type: "Satellite EO 30cm GSD",
    default_altitude: 800.0,
    default_gsd: 30.0
  }
];

export const UploadPage: React.FC = () => {
  const { 
    currentResult, 
    processUploadedImage, 
    triggerLiveDemo, 
    isLoading 
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileMeta, setFileMeta] = useState<{ name: string; size: string; res: string; type: string } | null>(null);
  const [demos, setDemos] = useState<DemoPreset[]>(DEFAULT_DEMOS);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Backend connection status & manual URL configuration
  const [apiUrl, setApiUrl] = useState<string>(getStoredApiUrl());
  const [isEditingApiUrl, setIsEditingApiUrl] = useState<boolean>(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [backendEngineName, setBackendEngineName] = useState<string>('');

  // 2D GIS Overlays
  const [overlayMode, setOverlayMode] = useState<'none' | 'depth' | 'height' | 'objects'>('none');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);

  const [lastCheckError, setLastCheckError] = useState<string>('');

  const checkHealth = () => {
    setBackendStatus('checking');
    setLastCheckError('');
    api.getHealth()
      .then((health) => {
        setBackendStatus('connected');
        setBackendEngineName(health.ai_model?.engine || 'Depth Anything V2');
        setLastCheckError('');
      })
      .catch((err) => {
        setBackendStatus('disconnected');
        setLastCheckError(err?.message || 'Connection failed or timed out');
      });
  };

  useEffect(() => {
    checkHealth();
    api.getDemos().then((res: { demos: DemoPreset[] }) => {
      if (res && res.demos && res.demos.length > 0) {
        setDemos(res.demos);
      }
    }).catch(console.warn);
  }, []);

  const handleSaveApiUrl = () => {
    setStoredApiUrl(apiUrl);
    setIsEditingApiUrl(false);
    checkHealth();
  };

  const handleFileSelect = (file: File) => {
    setUploadError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setFilePreview(url);

    // Calculate dimensions
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setFileMeta({
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        res: `${img.width} × ${img.height} px`,
        type: file.type || 'image/png'
      });
    };
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setUploadError(null);
    try {
      const uploadRes = await api.uploadImage(selectedFile);
      await processUploadedImage(uploadRes.image_id);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Upload failed. Check if your backend URL is set and running.');
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Page Title & Backend Connection Status Header */}
      <div className="pb-4 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-cyan-400" />
            <span>Image Ingestion & Geospatial Pre-Analysis</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Upload single-view aerial/satellite electro-optical (EO) imagery in JPG, PNG, WEBP or GeoTIFF.
          </p>
        </div>

        {/* Backend API Connection Status Chip */}
        <div className="flex items-center space-x-2 bg-navy-950/90 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono shadow-glass">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${
              backendStatus === 'connected' 
                ? 'bg-emerald-400 shadow-glow-emerald' 
                : backendStatus === 'checking' 
                ? 'bg-amber-400 animate-pulse' 
                : 'bg-rose-500'
            }`} />
            <span className="text-slate-400">Backend:</span>
            <span className={backendStatus === 'connected' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-semibold'}>
              {backendStatus === 'connected' ? 'Connected' : backendStatus === 'checking' ? 'Waking Up...' : 'Not Connected'}
            </span>
          </div>

          {backendStatus !== 'connected' && (
            <button
              onClick={checkHealth}
              disabled={backendStatus === 'checking'}
              className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition flex items-center space-x-1 font-bold disabled:opacity-50"
              title="Ping Render backend to wake up from sleep"
            >
              <RefreshCw className={`w-3 h-3 ${backendStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>{backendStatus === 'checking' ? 'Waking Up...' : 'Reconnect'}</span>
            </button>
          )}

          <button
            onClick={() => setIsEditingApiUrl(!isEditingApiUrl)}
            className="px-2 py-1 rounded bg-navy-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition flex items-center space-x-1"
          >
            <Link2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{apiUrl ? 'Edit URL' : 'Set Backend URL'}</span>
          </button>
        </div>
      </div>

      {/* Expandable Backend URL Setting Box */}
      {isEditingApiUrl && (
        <div className="p-4 bg-navy-900/95 border border-cyan-500/40 rounded-xl space-y-3 font-mono text-xs shadow-2xl animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="font-bold text-cyan-300 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Connect Backend AI Web Service</span>
            </span>
            <button
              onClick={() => setIsEditingApiUrl(false)}
              className="text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-400 font-sans text-xs">
            Enter your deployed Render backend URL (default: <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">https://depthwizard-ai.onrender.com</code>).
            <span className="block mt-1 text-slate-500 text-[11px]">
              💡 <strong>Render Free Tier Note:</strong> The cloud server automatically spins down (sleeps) after 15 minutes of inactivity. When reconnecting, the initial wake-up takes ~30–50 seconds.
            </span>
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://depthwizard-ai.onrender.com"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
            />
            <button
              onClick={handleSaveApiUrl}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Save & Connect</span>
            </button>
          </div>
          {apiUrl && (
            <div className="text-[11px] text-slate-500 flex flex-col space-y-1.5 pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span>
                  Target: <a href={`${apiUrl.replace(/\/+$/, '')}/api/health`} target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline font-mono">{apiUrl.replace(/\/+$/, '')}/api/health</a>
                </span>
                <button 
                  onClick={checkHealth}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Test Connection</span>
                </button>
              </div>
              {lastCheckError && (
                <div className="text-[10px] text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-500/30">
                  ⚠️ Status: {lastCheckError}. The server may be waking up from sleep. Click the link above in a new tab or click "Test Connection" again in 20 seconds.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Drag & Drop Ingestion Zone */}
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[260px] ${
              dragActive 
                ? 'border-cyan-400 bg-cyan-950/30 shadow-glow-cyan' 
                : 'border-slate-700 bg-navy-900/60 hover:border-cyan-500/50 hover:bg-navy-900/90'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.tif,.tiff"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mb-3 text-cyan-400 shadow-glow-cyan">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="text-sm font-mono font-bold text-slate-200">
              Drag & Drop Aerial Image Here
            </div>
            <p className="text-xs text-slate-400 mt-1">
              or click to browse your local file system
            </p>
            <span className="text-[10px] font-mono text-slate-500 mt-3 px-2 py-0.5 rounded bg-slate-800">
              Supported: JPG • PNG • WEBP • TIFF (Max 25MB)
            </span>
          </div>

          {/* Selected File Metadata Card */}
          {fileMeta && (
            <div className="bg-navy-900/90 border border-cyan-500/30 rounded-xl p-4 shadow-glass text-xs font-mono space-y-2">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold pb-2 border-b border-slate-800">
                <FileImage className="w-4 h-4" />
                <span className="truncate">{fileMeta.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500">RESOLUTION:</span>
                  <div>{fileMeta.res}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">FILE SIZE:</span>
                  <div>{fileMeta.size}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">FORMAT:</span>
                  <div className="uppercase">{fileMeta.type.split('/')[1] || 'IMAGE'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">INGESTION:</span>
                  <div className="text-emerald-400 font-semibold">Ready</div>
                </div>
              </div>

              {/* Upload Error Alert */}
              {uploadError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-lg text-rose-200 text-xs font-mono space-y-1.5 animate-in fade-in">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Upload Error</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-300 font-sans">
                    {uploadError}
                  </p>
                  <p className="text-[10px] text-amber-300">
                    💡 If your Render web service is on the free tier, it spins down when inactive and takes ~50s to wake up on the first request. Check your Backend URL above.
                  </p>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold rounded-lg font-mono text-xs shadow-glow-cyan flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-navy-950" />
                <span>{isLoading ? 'ANALYZING...' : 'ANALYZE IMAGE'}</span>
              </button>
            </div>
          )}

          {/* Built-in Demo Presets Catalog */}
          <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-4 shadow-glass">
            <div className="text-xs font-mono font-bold text-white mb-2 flex items-center justify-between">
              <span>BUILT-IN DEMO DATASETS</span>
              <span className="text-[10px] text-cyan-400">{demos.length} PRESETS</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 font-sans">
              Instant standalone satellite imagery ready for evaluation with zero wait time.
            </p>

            <div className="space-y-2.5">
              {demos.map((d) => (
                <div
                  key={d.id}
                  onClick={() => triggerLiveDemo(d.id)}
                  className="p-2.5 rounded-lg border border-slate-800 hover:border-cyan-400/50 bg-slate-950/60 hover:bg-cyan-950/20 cursor-pointer transition flex items-center space-x-3 group"
                >
                  <img
                    src={resolveApiUrl(d.thumbnail_url)}
                    alt={d.title}
                    className="w-12 h-12 rounded object-cover border border-slate-700 group-hover:border-cyan-400 transition"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                      {d.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {d.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (2 Spans): Interactive Imagery Preview & Multi-Layer GIS Canvas */}
        <div className="lg:col-span-2 space-y-4 flex flex-col">
          
          {/* GIS Layer Controls Header */}
          <div className="flex items-center justify-between bg-navy-900/90 border border-slate-800 p-3 rounded-xl shadow-glass">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-400 font-bold">INSPECTION OVERLAY:</span>
              <div className="flex space-x-1">
                {(['none', 'depth', 'height'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setOverlayMode(mode)}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition ${
                      overlayMode === mode 
                        ? 'bg-cyan-500 text-navy-950 font-bold' 
                        : 'text-slate-400 hover:text-white bg-slate-950/60'
                    }`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowGridOverlay(!showGridOverlay)}
                className={`p-1.5 rounded transition ${
                  showGridOverlay ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/40' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Toggle Photogrammetric Grid"
              >
                <GridIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Opacity Slider for Overlays */}
          {overlayMode !== 'none' && (
            <div className="flex items-center space-x-3 bg-navy-950/60 px-4 py-2 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-400">OVERLAY OPACITY:</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <span className="text-cyan-400 font-bold">{(overlayOpacity * 100).toFixed(0)}%</span>
            </div>
          )}

          {/* Interactive GIS Display Canvas */}
          <div className="flex-1 min-h-[460px] relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
            
            {/* Base RGB Image */}
            <img
              src={filePreview || resolveApiUrl(currentResult?.image_url || '/demo_assets/demo_urban_commercial.png')}
              alt="Satellite Base Layer"
              className="max-h-[520px] max-w-full object-contain select-none"
            />

            {/* Depth Map Overlay */}
            {overlayMode === 'depth' && currentResult && (
              <img
                src={resolveApiUrl(currentResult.depth.colorized_depth_url)}
                alt="Depth Overlay"
                style={{ opacity: overlayOpacity }}
                className="absolute inset-0 m-auto max-h-[520px] max-w-full object-contain pointer-events-none transition-opacity"
              />
            )}

            {/* Height Map Overlay */}
            {overlayMode === 'height' && currentResult && (
              <img
                src={resolveApiUrl(currentResult.height.colorized_height_url)}
                alt="Height Overlay"
                style={{ opacity: overlayOpacity }}
                className="absolute inset-0 m-auto max-h-[520px] max-w-full object-contain pointer-events-none transition-opacity"
              />
            )}

            {/* Grid Overlay */}
            {showGridOverlay && (
              <div className="absolute inset-0 pointer-events-none cyber-grid opacity-40" />
            )}

            {/* Telemetry HUD Badge */}
            <div className="absolute bottom-3 left-3 bg-navy-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-300 flex items-center space-x-3">
              <span>GSD: 15.0 cm/px</span>
              <span>•</span>
              <span>DATUM: WGS84 EGM96</span>
              <span>•</span>
              <span>NADIR VIEW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
