import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileImage, Sparkles, CheckCircle2, 
  Layers, Mountain, Target, Grid as GridIcon, Sliders, Info 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api, resolveApiUrl } from '../services/api';
import { DemoPreset, ObjectItem } from '../types';

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
  const [demos, setDemos] = useState<DemoPreset[]>([]);

  // 2D GIS Overlays
  const [overlayMode, setOverlayMode] = useState<'none' | 'depth' | 'height' | 'objects'>('none');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.65);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);

  useEffect(() => {
    api.getDemos().then((res: { demos: DemoPreset[] }) => setDemos(res.demos)).catch(console.warn);
  }, []);

  const handleFileSelect = (file: File) => {
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
    try {
      const uploadRes = await api.uploadImage(selectedFile);
      await processUploadedImage(uploadRes.image_id);
    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message}`);
    }
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Page Title */}
      <div className="pb-4 border-b border-cyan-500/20">
        <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          <span>Image Ingestion & Geospatial Pre-Analysis</span>
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Upload single-view aerial/satellite electro-optical (EO) imagery in JPG, PNG, WEBP or GeoTIFF.
        </p>
      </div>

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

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-3 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold rounded-lg font-mono text-xs shadow-glow-cyan flex items-center justify-center space-x-2 transition disabled:opacity-50"
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
              <span className="text-[10px] text-cyan-400">3 PRESETS</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3 font-sans">
              Instant standalone satellite imagery ready for evaluation without requiring external API keys.
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

        {/* Right 2 Columns: 2D GIS Satellite & Overlay Analysis Viewport */}
        <div className="lg:col-span-2 bg-navy-900/90 border border-cyan-500/20 rounded-2xl p-5 shadow-glass flex flex-col space-y-4">
          
          {/* GIS Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                2D GIS ANALYTICAL OVERLAYS
              </span>
            </div>

            {/* Overlay Selector */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setOverlayMode('none')}
                className={`px-2.5 py-1 rounded ${overlayMode === 'none' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                RGB Base
              </button>
              <button
                onClick={() => setOverlayMode('depth')}
                className={`px-2.5 py-1 rounded ${overlayMode === 'depth' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Depth
              </button>
              <button
                onClick={() => setOverlayMode('height')}
                className={`px-2.5 py-1 rounded ${overlayMode === 'height' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Height
              </button>
              <button
                onClick={() => setOverlayMode('objects')}
                className={`px-2.5 py-1 rounded ${overlayMode === 'objects' ? 'bg-cyan-500 text-navy-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Objects
              </button>
            </div>

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGridOverlay(!showGridOverlay)}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1 ${
                showGridOverlay ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <GridIcon className="w-3.5 h-3.5" />
              <span>Grid</span>
            </button>
          </div>

          {/* Opacity Slider */}
          {overlayMode !== 'none' && (
            <div className="flex items-center space-x-3 text-xs font-mono bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400">OVERLAY OPACITY:</span>
              <input
                type="range"
                min="0"
                max="1"
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

            {/* Detected Object Bounding Footprints */}
            {(overlayMode === 'objects' || overlayMode === 'height') && currentResult?.objects?.objects.map((obj: ObjectItem) => {
              // Convert 768x768 coordinates to percentage
              const [ymin, xmin, ymax, xmax] = obj.bbox;
              const top = `${(ymin / 768) * 100}%`;
              const left = `${(xmin / 768) * 100}%`;
              const width = `${((xmax - xmin) / 768) * 100}%`;
              const height = `${((ymax - ymin) / 768) * 100}%`;

              return (
                <div
                  key={obj.id}
                  style={{ top, left, width, height }}
                  className="absolute border border-cyan-400 bg-cyan-400/15 pointer-events-auto hover:bg-cyan-400/30 transition cursor-pointer group"
                >
                  <div className="opacity-0 group-hover:opacity-100 transition absolute -top-6 left-0 bg-navy-950 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-400 whitespace-nowrap shadow-lg z-10">
                    {obj.id}: {obj.estimated_height} {obj.height_unit}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] font-mono text-slate-500 flex justify-between">
            <span>Coordinate System: Local UTM WGS84 Pseudo-Mercator</span>
            <span>Ground Resolution: 15 cm/pixel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
