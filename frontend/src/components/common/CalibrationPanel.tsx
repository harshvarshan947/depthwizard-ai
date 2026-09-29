import React from 'react';
import { 
  Sliders, ShieldCheck, AlertCircle, HelpCircle, Info, RefreshCw 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CalibrationPanel: React.FC = () => {
  const { calibration, updateCalibration, currentResult, triggerLiveDemo, isLoading } = useApp();

  return (
    <div className="bg-navy-900/90 border border-cyan-500/20 rounded-xl p-5 shadow-glass space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Photogrammetric Scene Calibration
          </h3>
        </div>
        
        {/* Toggle Enabled */}
        <label className="flex items-center cursor-pointer space-x-2">
          <span className="text-[11px] font-mono text-slate-300">
            {calibration.is_calibrated ? 'Calibration ON' : 'Relative Mode'}
          </span>
          <input
            type="checkbox"
            checked={calibration.is_calibrated}
            onChange={(e) => updateCalibration({ is_calibrated: e.target.checked })}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </label>
      </div>

      {/* Scientific Honesty Notice Box */}
      <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
        calibration.is_calibrated 
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
          : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
      }`}>
        <div className="flex items-start space-x-2">
          {calibration.is_calibrated ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-mono font-bold">
              {calibration.is_calibrated ? 'METRIC CALIBRATION ACTIVE' : 'RELATIVE DEPTH MODE ACTIVE'}
            </div>
            <p className="text-[11px] mt-0.5 opacity-90 font-sans">
              {calibration.is_calibrated
                ? 'Height values are scaled to metric meters using sensor altitude, ground sampling distance, and anchor structures.'
                : 'Monocular depth produces relative depth gradients. Absolute metric height requires scene calibration or reference elevation data.'}
            </p>
          </div>
        </div>
      </div>

      {/* Calibration Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Camera Altitude */}
        <div>
          <label className="block text-slate-400 mb-1">
            Camera / Flight Altitude (m)
          </label>
          <input
            type="number"
            value={calibration.camera_altitude_m}
            onChange={(e) => updateCalibration({ camera_altitude_m: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 px-3 py-1.5 rounded-lg text-white"
            placeholder="e.g. 500"
          />
        </div>

        {/* Ground Sampling Distance (GSD) */}
        <div>
          <label className="block text-slate-400 mb-1">
            Ground Sampling Distance (cm/px)
          </label>
          <input
            type="number"
            value={calibration.ground_sampling_distance_cm}
            onChange={(e) => updateCalibration({ ground_sampling_distance_cm: parseFloat(e.target.value) || 0 })}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 px-3 py-1.5 rounded-lg text-white"
            placeholder="e.g. 15.0"
          />
        </div>

        {/* Known Reference Structure Height */}
        <div>
          <label className="block text-slate-400 mb-1">
            Known Structure Anchor Height (m)
          </label>
          <input
            type="number"
            value={calibration.reference_height_m ?? ''}
            onChange={(e) => updateCalibration({ reference_height_m: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 px-3 py-1.5 rounded-lg text-white"
            placeholder="e.g. 24.5 (Optional anchor)"
          />
        </div>

        {/* Geodetic Vertical Datum */}
        <div>
          <label className="block text-slate-400 mb-1">
            Vertical Datum Reference
          </label>
          <select
            value={calibration.elevation_datum}
            onChange={(e) => updateCalibration({ elevation_datum: e.target.value })}
            className="w-full bg-slate-950/80 border border-slate-700 focus:border-cyan-400 px-3 py-1.5 rounded-lg text-white cursor-pointer"
          >
            <option value="WGS84_EGM96">WGS84 / EGM96 Geoid</option>
            <option value="LOCAL_GROUND_ZERO">Local Ground Baseline (0m)</option>
            <option value="MSL_SURFACE">Mean Sea Level (MSL)</option>
            <option value="SRTM_DEM_REFERENCE">SRTM / AW3D30 Baseline</option>
          </select>
        </div>
      </div>

      {/* Recalculate Button */}
      {currentResult && (
        <button
          onClick={() => triggerLiveDemo(currentResult.image_id)}
          disabled={isLoading}
          className="w-full py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-mono text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Apply Calibration & Recalculate Height Field</span>
        </button>
      )}
    </div>
  );
};
