import React from 'react';
import { 
  Sparkles, ArrowRight, Layers, Mountain, 
  Box, Navigation, Target, Download, ShieldCheck, 
  CheckCircle2, Compass, Eye, ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LandingPage: React.FC = () => {
  const { setActiveTab, triggerLiveDemo, isLoading } = useApp();

  const workflowSteps = [
    { num: '01', title: 'Upload Aerial Imagery', desc: 'Ingest single-perspective satellite or drone electro-optical (EO) images.' },
    { num: '02', title: 'Estimate AI Depth', desc: 'Depth Anything V2 computes dense, continuous relative depth fields.' },
    { num: '03', title: 'Calibrate Height', desc: 'Apply GSD, flight altitude, and ground anchor references for metric scaling.' },
    { num: '04', title: 'Reconstruct 3D Mesh', desc: 'Synthesize high-density triangulated terrain and building geometry in real time.' },
    { num: '05', title: 'Flythrough & Explore', desc: 'Navigate the reconstructed environment with first-person 6-DOF controls.' },
  ];

  const capabilities = [
    { title: 'AI Depth Estimation', desc: 'Monocular foundation models predicting structural depth without multi-view stereo.', icon: Layers },
    { title: 'Height Analysis', desc: 'Derive building elevations, ground baseline separation, and hypsometric maps.', icon: Mountain },
    { title: '3D Terrain Reconstruction', desc: 'Instant GPU vertex displacement mesh with realistic lighting and wireframe toggles.', icon: Box },
    { title: 'Object & Structure Analysis', desc: 'Automatic footprint clustering, 3D spatial centroids, and building tiers.', icon: Target },
    { title: 'Interactive Flythrough', desc: '6-DOF drone simulation with keyboard navigation and custom cruise speeds.', icon: Navigation },
    { title: 'Multi-Format Export', desc: 'Export Wavefront OBJ, Stanford PLY point clouds, PNG rasters, and SIH reports.', icon: Download },
  ];

  return (
    <div className="flex-1 overflow-y-auto select-none">
      
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-28 flex flex-col items-center text-center max-w-5xl mx-auto">
        
        {/* Glowing cyber aura */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Team & SIH Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-6 shadow-glow-cyan">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>SMART INDIA HACKATHON // TEAM PARALLAX</span>
        </div>

        {/* Project Name & Hero Tagline */}
        <h1 className="text-4xl md:text-6xl font-mono font-black text-white tracking-tight leading-tight">
          DEPTHWIZARD <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyber-cyan">AI</span>
        </h1>
        <p className="text-xl md:text-2xl font-mono text-cyan-300/90 mt-3 font-semibold">
          "From a single view to an explorable 3D world."
        </p>

        <p className="text-sm md:text-base text-slate-400 font-sans max-w-2xl mt-4 leading-relaxed">
          AI-assisted single-view depth estimation, height reconstruction, and interactive 3D flythrough for geospatial intelligence and urban planning.
        </p>

        {/* Hero CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold font-mono text-sm shadow-glow-cyan transition transform hover:scale-[1.03]"
          >
            <span>Launch Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => triggerLiveDemo('demo_urban_commercial')}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl border border-cyan-500/40 bg-navy-900/80 hover:bg-cyan-950/40 text-cyan-300 font-bold font-mono text-sm shadow-glass transition transform hover:scale-[1.03]"
          >
            <Sparkles className="w-4 h-4 fill-cyan-400" />
            <span>{isLoading ? 'PROCESSING PIPELINE...' : 'Try Live Demo'}</span>
          </button>
        </div>

        {/* Scientific Honesty Disclaimer Tag */}
        <div className="mt-8 flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scientifically honest: Distinguishes relative monocular depth from calibrated metric height</span>
        </div>
      </section>

      {/* How It Works Workflow Steps */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            END-TO-END PIPELINE
          </span>
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
            HOW IT WORKS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((s, idx) => (
            <div
              key={s.num}
              className="bg-navy-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 shadow-glass flex flex-col justify-between transition group"
            >
              <div>
                <div className="text-2xl font-mono font-black text-cyan-400/40 group-hover:text-cyan-400 transition mb-3">
                  {s.num}
                </div>
                <h3 className="text-sm font-mono font-bold text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Capabilities */}
      <section className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
            COMPREHENSIVE GEOSPATIAL SUITE
          </span>
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-white mt-1">
            KEY CAPABILITIES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="bg-navy-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-6 shadow-glass flex items-start space-x-4 transition group"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-110 transition shadow-glow-cyan">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-white group-hover:text-cyan-300 transition">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Presentation Footer */}
      <footer className="py-10 px-6 border-t border-slate-800/80 text-center font-mono text-xs text-slate-500">
        <p>DEPTHWIZARD AI • Built by Team PARALLAX for Smart India Hackathon</p>
        <p className="mt-1 text-[11px] text-slate-600">Single-View Height Estimation & 3D Flythrough</p>
      </footer>
    </div>
  );
};
