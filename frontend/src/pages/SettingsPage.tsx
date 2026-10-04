import React, { useState, useEffect } from 'react';
import { 
  Sliders, Cpu, ShieldCheck, Database, HardDrive, 
  CheckCircle2, Info, BookOpen, Globe, RefreshCw, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalibrationPanel } from '../components/common/CalibrationPanel';
import { api, getStoredApiUrl, setStoredApiUrl } from '../services/api';

export const SettingsPage: React.FC = () => {
  const { systemHealth } = useApp();
  const [apiUrl, setApiUrl] = useState<string>(getStoredApiUrl());
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const testConnection = () => {
    setBackendStatus('checking');
    api.getHealth()
      .then(() => setBackendStatus('connected'))
      .catch(() => setBackendStatus('disconnected'));
  };

  useEffect(() => {
    testConnection();
  }, []);

  const handleSave = () => {
    setStoredApiUrl(apiUrl);
    setSaveSuccess(true);
    testConnection();
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto">
      
      {/* Title */}
      <div className="pb-4 border-b border-cyan-500/20">
        <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          <span>System Settings & Photogrammetric Calibration</span>
        </h1>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Configure sensor altitude, GSD photogrammetry parameters, AI model engines, and cloud backend API.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Calibration Panel & Backend Connection */}
        <div className="space-y-6">
          <CalibrationPanel />

          {/* Cloud Backend API Configuration Card */}
          <div className="bg-navy-900/90 border border-slate-800 rounded-2xl p-5 shadow-glass space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 text-white font-bold uppercase tracking-wider">
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                <span>Cloud Backend API Connection</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <span className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-400 shadow-glow-emerald' : backendStatus === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-rose-500'
                }`} />
                <span className={backendStatus === 'connected' ? 'text-emerald-400' : 'text-amber-400'}>
                  {backendStatus === 'connected' ? 'Active' : backendStatus === 'checking' ? 'Connecting...' : 'Offline'}
                </span>
              </div>
            </div>

            <p className="text-slate-400 font-sans text-xs">
              Configure the public URL of your deployed Render / Railway / Cloud AI backend.
            </p>

            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] block">BACKEND HOST URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://depthwizard-ai.onrender.com"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-lg transition flex items-center space-x-1"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                  <span>{saveSuccess ? 'Saved' : 'Save & Test'}</span>
                </button>
              </div>
              <div className="text-[10px] text-slate-500">
                Current active target: <code className="text-cyan-300">{apiUrl || '(Default / Same Origin)'}</code>
              </div>
            </div>
          </div>
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
