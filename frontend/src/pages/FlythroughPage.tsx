import React, { useEffect } from 'react';
import { 
  Navigation, Eye, Compass, Move, Zap, 
  RotateCcw, ShieldCheck 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ThreeDViewport } from '../components/3d/ThreeDViewport';

export const FlythroughPage: React.FC = () => {
  const { 
    flythroughActive, 
    setFlythroughActive, 
    flythroughSpeed, 
    setFlythroughSpeed,
    setActiveTab 
  } = useApp();

  // Activate flythrough on mounting this page; deactivate cleanly on unmounting
  useEffect(() => {
    setFlythroughActive(true);
    return () => {
      setFlythroughActive(false);
    };
  }, [setFlythroughActive]);

  return (
    <div className="flex-1 p-6 space-y-4 flex flex-col overflow-y-auto">
      
      {/* Header */}
      <div className="pb-3 border-b border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <span>First-Person 6-DOF Drone / Aircraft Flythrough</span>
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Real-time immersive flight navigation through the AI-reconstructed 3D geospatial environment.
          </p>
        </div>

        {/* Speed Multiplier & Orbit Return Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-navy-900 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
            <span className="text-slate-400">CRUISE SPEED:</span>
            <div className="flex space-x-1">
              {[0.5, 1.0, 2.0, 5.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setFlythroughSpeed(s)}
                  className={`px-2 py-0.5 rounded font-bold transition ${
                    flythroughSpeed === s 
                      ? 'bg-cyan-500 text-navy-950 shadow-glow-cyan' 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              setFlythroughActive(false);
              setActiveTab('reconstruction');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono transition"
            title="Return to 3D Orbit Mesh View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Orbit View</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with Flythrough Active */}
      <div className="flex-1 min-h-[580px] w-full flex flex-col">
        <ThreeDViewport />
      </div>

      {/* Controls Quick Reference Strip */}
      <div className="bg-navy-900/80 border border-slate-800 rounded-xl p-3 shadow-glass flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-4 flex-wrap gap-y-1">
          <span className="text-cyan-400 font-bold flex items-center space-x-1">
            <Move className="w-4 h-4" />
            <span>WASD FLIGHT CONTROLS:</span>
          </span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">W</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">S</kbd> Forward / Back</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">A</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">D</kbd> Strafe Left / Right</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">Space</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">E</kbd> Ascend</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">Ctrl</kbd>/<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">Q</kbd> Descend</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-cyan-300">Shift</kbd> Turbo Boost</span>
        </div>

        <div className="text-[11px] text-cyan-400/80 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Click viewport to lock mouse for 360° free-look (press ESC to release)</span>
        </div>
      </div>
    </div>
  );
};
