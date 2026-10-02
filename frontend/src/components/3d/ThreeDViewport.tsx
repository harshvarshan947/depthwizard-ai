import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Compass, Maximize2, Minimize2, RotateCcw, Crosshair, 
  Eye, Zap, Layers, Navigation, Move, HelpCircle, X,
  Play, Pause, Grid3X3, Camera, Sliders, ShieldCheck, Gauge, Plane,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TerrainMesh } from './TerrainMesh';
import { FlythroughController, FlightTelemetry } from './FlythroughController';
import { MeasurementOverlay } from './MeasurementOverlay';

export const ThreeDViewport: React.FC = () => {
  const {
    currentResult,
    flythroughActive,
    setFlythroughActive,
    flythroughSpeed,
    setFlythroughSpeed,
    meshDisplayMode,
    setMeshDisplayMode,
    heightExaggeration,
    setHeightExaggeration,
    invertDepth,
    setInvertDepth,
    measurementMode,
    setMeasurementMode,
    measurementPoints,
    clearMeasurement,
    calibration
  } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<any>(null);
  const [showControlsHelp, setShowControlsHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframeOverlay, setWireframeOverlay] = useState(false);
  const [cursorElevation, setCursorElevation] = useState<{ x: number; y: number; z: number; height: number } | null>(null);
  
  // Real-time flight telemetry from FlythroughController
  const [telemetry, setTelemetry] = useState<FlightTelemetry>({
    headingDeg: 0,
    headingCardinal: 'N',
    altitudeM: 25.0,
    speedKmh: 0,
    isSprinting: false,
    isPointerLocked: false,
    x: 0,
    y: 22,
    z: 42
  });
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  // Sync fullscreen state with document events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn('Fullscreen request failed:', err));
    } else {
      document.exitFullscreen().catch((err) => console.warn('Exit fullscreen failed:', err));
    }
  };

  // Reset camera view to default oblique aerial perspective
  const handleResetCamera = () => {
    if (orbitRef.current) {
      orbitRef.current.target.set(0, 0, 0);
      orbitRef.current.object.position.set(35, 45, 50);
      orbitRef.current.object.up.set(0, 1, 0);
      orbitRef.current.object.lookAt(0, 0, 0);
      orbitRef.current.update();
    }
  };

  // Preset camera angles
  const setCameraPreset = (preset: 'isometric' | 'top' | 'horizon') => {
    if (!orbitRef.current) return;
    orbitRef.current.target.set(0, 0, 0);
    orbitRef.current.object.up.set(0, 1, 0);
    if (preset === 'isometric') {
      orbitRef.current.object.position.set(35, 45, 50);
    } else if (preset === 'top') {
      orbitRef.current.object.position.set(0, 85, 0.001);
    } else if (preset === 'horizon') {
      orbitRef.current.object.position.set(0, 10, 75);
    }
    orbitRef.current.object.lookAt(0, 0, 0);
    orbitRef.current.update();
  };

  // Safe Exit from Flythrough mode back to Orbit Controls
  const handleExitFlythrough = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock?.();
    }
    setFlythroughActive(false);
    // Explicitly reset orbit camera to clean orientation
    setTimeout(() => {
      handleResetCamera();
    }, 50);
  };

  // Safe Enter into Flythrough mode
  const handleEnterFlythrough = () => {
    setMeasurementMode(false);
    setAutoRotate(false);
    setFlythroughActive(true);
  };

  // Measurement calculations
  const pt1 = measurementPoints[0];
  const pt2 = measurementPoints[1];
  let distanceVal = 0;
  let deltaHeight = 0;

  if (pt1 && pt2) {
    const dx = pt2.x - pt1.x;
    const dy = pt2.y - pt1.y;
    const dz = pt2.z - pt1.z;
    distanceVal = Math.sqrt(dx * dx + dy * dy + dz * dz);
    deltaHeight = Math.abs(dy);
  }

  const isCalibrated = calibration.is_calibrated;
  const unitLabel = isCalibrated ? 'm' : 'rel units';
  const scaleMultiplier = isCalibrated 
    ? (calibration.reference_height_m ? (calibration.reference_height_m / 20.0) : 1.2) 
    : 1.0;

  const displayDistance = (distanceVal * scaleMultiplier).toFixed(1);
  const displayDeltaH = (deltaHeight * scaleMultiplier).toFixed(1);

  return (
    <div 
      ref={containerRef} 
      className={`relative w-full h-full min-h-[540px] bg-navy-950 rounded-xl overflow-hidden border border-cyan-500/20 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none min-h-screen' : ''
      }`}
    >
      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [35, 45, 50], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050811']} />
        <fog attach="fog" args={['#050811', 85, 230]} />

        {/* Ambient & Directional Sun Lighting for Photogrammetric Relief */}
        <ambientLight intensity={0.75} />
        <directionalLight
          position={[60, 90, 40]}
          intensity={2.0}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={260}
          shadow-camera-left={-65}
          shadow-camera-right={65}
          shadow-camera-top={65}
          shadow-camera-bottom={-65}
        />
        <pointLight position={[-45, 55, -45]} intensity={0.65} color="#00F0FF" />
        <directionalLight position={[-30, -10, -30]} intensity={0.25} color="#3B82F6" />

        {/* Ground Reference Grid */}
        <Grid
          position={[0, -5.05, 0]}
          args={[160, 160]}
          cellSize={5}
          cellThickness={1}
          cellColor="#0284C7"
          sectionSize={20}
          sectionThickness={1.5}
          sectionColor="#00F0FF"
          fadeDistance={180}
        />

        {/* Height Field Mesh */}
        <TerrainMesh
          onHoverElevation={!flythroughActive ? setCursorElevation : undefined}
          wireframeOverlay={wireframeOverlay}
        />

        {/* Measurement markers and lines (active when in Orbit / Measure mode) */}
        {!flythroughActive && <MeasurementOverlay />}

        {/* Permanently mounted OrbitControls with enabled toggle to preserve listeners */}
        <OrbitControls
          ref={orbitRef}
          makeDefault
          enabled={!flythroughActive}
          enableDamping
          dampingFactor={0.05}
          autoRotate={autoRotate && !flythroughActive}
          autoRotateSpeed={1.2}
          maxPolarAngle={Math.PI / 2.05}
          minDistance={8}
          maxDistance={220}
        />

        {/* First-Person 6-DOF Flythrough Controller */}
        {flythroughActive && (
          <FlythroughController
            orbitRef={orbitRef}
            onTelemetryUpdate={setTelemetry}
            onPointerLockStatusChange={setIsPointerLocked}
          />
        )}
      </Canvas>

      {/* Flythrough Mode Center HUD Reticle */}
      {flythroughActive && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
          <div className="relative flex items-center justify-center">
            {/* Center Crosshair Dot */}
            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-glow-cyan" />
            
            {/* Outer Circular Reticle Ring */}
            <div className="absolute w-12 h-12 rounded-full border border-cyan-400/40 animate-pulse" />
            
            {/* Horizontal Artificial Horizon Wings */}
            <div className="absolute -left-8 w-5 h-0.5 bg-cyan-400/60" />
            <div className="absolute -right-8 w-5 h-0.5 bg-cyan-400/60" />
            
            {/* Top / Bottom Pitch Ticks */}
            <div className="absolute -top-7 w-0.5 h-3 bg-cyan-400/60" />
            <div className="absolute -bottom-7 w-0.5 h-3 bg-cyan-400/60" />
          </div>
        </div>
      )}

      {/* Top Floating Toolbar */}
      <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-20 bg-navy-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 shadow-glass">
        {/* Orbit Mode */}
        <button
          onClick={handleExitFlythrough}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            !flythroughActive && !measurementMode
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Interactive Orbit Camera"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Orbit</span>
        </button>

        {/* Flythrough Mode Toggle */}
        <button
          onClick={flythroughActive ? handleExitFlythrough : handleEnterFlythrough}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
            flythroughActive
              ? 'bg-cyber-cyan text-navy-950 font-bold shadow-glow-cyan'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40'
          }`}
          title="First-Person Drone Flythrough"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{flythroughActive ? 'Exit Flythrough' : 'Flythrough'}</span>
        </button>

        {/* Measurement Mode (disabled during flythrough) */}
        {!flythroughActive && (
          <button
            onClick={() => setMeasurementMode(!measurementMode)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
              measurementMode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
            title="Measure 3D Distance & ΔZ"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Measure</span>
          </button>
        )}

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Auto Rotate Turntable (only in Orbit mode) */}
        {!flythroughActive && (
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title={autoRotate ? "Pause Auto-Rotation" : "360° Auto-Rotate Turntable"}
            className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-mono transition ${
              autoRotate 
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {autoRotate ? <Pause className="w-3.5 h-3.5 text-cyan-300" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Rotate</span>
          </button>
        )}

        {/* Camera View Presets (only in Orbit mode) */}
        {!flythroughActive && (
          <div className="flex items-center space-x-0.5 bg-slate-950/50 rounded-md p-0.5 border border-slate-800">
            <button
              onClick={() => setCameraPreset('isometric')}
              title="3D Oblique Isometric View"
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
            >
              3D
            </button>
            <button
              onClick={() => setCameraPreset('top')}
              title="2D Top-Down Nadir View"
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
            >
              Top
            </button>
            <button
              onClick={() => setCameraPreset('horizon')}
              title="Horizon Elevation Profile View"
              className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
            >
              Side
            </button>
          </div>
        )}

        {/* Reset Camera */}
        <button
          onClick={handleResetCamera}
          title="Reset Camera to Center"
          className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 rounded-md transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
          className={`p-1.5 rounded-md transition ${
            isFullscreen 
              ? 'text-cyan-300 bg-cyan-950/50 border border-cyan-400/40' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Controls Help */}
        <button
          onClick={() => setShowControlsHelp(!showControlsHelp)}
          title="View 3D Controls Help"
          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Right North Compass & Telemetry Badges */}
      <div className="absolute top-4 right-4 flex flex-col items-end space-y-2 z-20 pointer-events-none">
        {/* Dynamic Flight Compass or North Compass */}
        <div className="flex items-center space-x-2 bg-navy-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-glass">
          <Compass className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>
            {flythroughActive 
              ? `HEADING: ${String(telemetry.headingDeg).padStart(3, '0')}° ${telemetry.headingCardinal}`
              : 'TRUE NORTH: 000° N'}
          </span>
        </div>

        {/* Live Elevation Coordinates under Cursor (in Orbit mode) */}
        {!flythroughActive && cursorElevation && (
          <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-cyan-500/40 text-[11px] font-mono shadow-glass flex items-center space-x-2">
            <span className="text-slate-400">POINT:</span>
            <span className="text-cyan-300 font-bold">
              X:{cursorElevation.x > 0 ? `+${cursorElevation.x.toFixed(1)}` : cursorElevation.x.toFixed(1)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300 font-bold">
              Z:{cursorElevation.z > 0 ? `+${cursorElevation.z.toFixed(1)}` : cursorElevation.z.toFixed(1)}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-bold">
              ELEV: {cursorElevation.height.toFixed(1)} {unitLabel}
            </span>
          </div>
        )}

        {/* Live Flight Telemetry (in Flythrough mode) */}
        {flythroughActive && (
          <div className="bg-navy-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-cyan-500/40 text-[11px] font-mono shadow-glass flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">ALT:</span>
              <span className="text-emerald-400 font-bold">{telemetry.altitudeM} {unitLabel}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">SPD:</span>
              <span className={`font-bold ${telemetry.isSprinting ? 'text-amber-400 animate-pulse' : 'text-cyan-300'}`}>
                {telemetry.speedKmh} km/h
              </span>
            </div>
            {telemetry.isSprinting && (
              <span className="px-1.5 py-0.2 text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 rounded font-bold">
                BOOST
              </span>
            )}
          </div>
        )}

        {/* Coordinate System Badge */}
        <div className="bg-navy-900/85 backdrop-blur-md px-3 py-1 rounded-md border border-slate-700/60 text-[10px] font-mono text-slate-400">
          {isCalibrated ? 'GEO-DATUM: WGS84 EGM96' : 'LOCAL CARTESIAN HEIGHT-FIELD'}
        </div>
      </div>

      {/* Flythrough Active HUD Card */}
      {flythroughActive && (
        <div className="absolute top-16 left-4 z-20 bg-navy-900/90 backdrop-blur-md p-4 rounded-xl border border-cyan-400/50 shadow-glow-cyan max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center space-x-1">
                <Plane className="w-3.5 h-3.5 inline mr-1 text-cyan-400" />
                6-DOF DRONE FLIGHT
              </span>
            </div>
            <button
              onClick={handleExitFlythrough}
              className="text-slate-400 hover:text-white p-1"
              title="Exit Flythrough (Return to Orbit)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mouse-look Pointer Lock Status */}
          <div className="mb-2.5 p-1.5 rounded-md bg-slate-950/70 border border-slate-800 text-[10px] font-mono flex items-center justify-between">
            <span className="text-slate-400">MOUSE LOOK:</span>
            {isPointerLocked ? (
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span>FPS LOCKED (ESC to free)</span>
              </span>
            ) : (
              <span className="text-cyan-300 font-bold">
                CLICK VIEWPORT TO LOCK
              </span>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-300 space-y-1 mb-3">
            <div className="flex justify-between">
              <span className="text-slate-400">W / S :</span>
              <span>Forward / Backward</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">A / D :</span>
              <span>Strafe Left / Right</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Space / Ctrl :</span>
              <span>Ascend / Descend</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shift :</span>
              <span className="text-amber-300 font-bold">Turbo Sprint (2.5x)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mouse :</span>
              <span>360° Free Look</span>
            </div>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 mb-3">
            <span className="text-[10px] font-mono text-slate-400">CRUISE SPEED:</span>
            <div className="flex space-x-1">
              {[0.5, 1.0, 2.0, 5.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setFlythroughSpeed(s)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded ${
                    flythroughSpeed === s
                      ? 'bg-cyan-500 text-navy-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          {/* Exit Flythrough Button */}
          <button
            onClick={handleExitFlythrough}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 hover:text-white rounded text-xs font-mono font-bold transition flex items-center justify-center space-x-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Exit to Orbit Controls</span>
          </button>
        </div>
      )}

      {/* Measurement Tool HUD Card (when in Measure mode) */}
      {!flythroughActive && measurementMode && (
        <div className="absolute top-16 left-4 z-20 bg-navy-900/90 backdrop-blur-md p-4 rounded-xl border border-emerald-400/50 shadow-glass max-w-xs animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold text-emerald-300 uppercase">
                GEOSPATIAL 3D MEASUREMENT
              </span>
            </div>
            <button
              onClick={() => setMeasurementMode(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-300 mb-3">
            {measurementPoints.length === 0 && 'Click Point A on the 3D terrain surface.'}
            {measurementPoints.length === 1 && 'Click Point B to measure distance and height difference.'}
            {measurementPoints.length >= 2 && 'Measurement complete.'}
          </p>

          {measurementPoints.length >= 2 && (
            <div className="space-y-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 mb-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">3D VECTOR DISTANCE:</span>
                <span className="text-cyan-300 font-bold">{displayDistance} {unitLabel}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">HEIGHT DIFFERENCE (ΔZ):</span>
                <span className="text-emerald-400 font-bold">{displayDeltaH} {unitLabel}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={clearMeasurement}
              className="flex-1 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition"
            >
              Reset Points
            </button>
          </div>
        </div>
      )}

      {/* Controls Help Modal */}
      {showControlsHelp && (
        <div className="absolute inset-0 z-30 bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-cyan-500/40 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-mono font-bold text-cyan-300 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4" />
                <span>3D VIEWPORT KEYBOARD & MOUSE SHORTCUTS</span>
              </h3>
              <button onClick={() => setShowControlsHelp(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs font-mono space-y-2.5 text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">Left Click + Drag</span>
                <span>Orbit / Rotate 3D Scene</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">Right Click + Drag</span>
                <span>Pan Camera</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">Scroll Wheel</span>
                <span>Smooth Zoom In / Out</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">Flythrough Mode</span>
                <span>W/A/S/D + Space/Ctrl + Shift</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">Pointer Lock</span>
                <span>Click viewport to lock mouse; ESC to release</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-cyan-400">1 / 2 / 3 / 4 / 5</span>
                <span>Quick Tab Navigation</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyan-400">P Key</span>
                <span>Toggle SIH Presentation Mode</span>
              </div>
            </div>
            <button
              onClick={() => setShowControlsHelp(false)}
              className="mt-5 w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs font-mono rounded transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Bottom Control Bar: Display Mode, Wireframe Overlay, Height Exaggeration */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 z-20 pointer-events-none">
        {/* Left: Shading / Texture Mode Selector + Wireframe Overlay Toggle */}
        <div className="flex items-center space-x-1.5 bg-navy-900/85 backdrop-blur-md p-1.5 rounded-lg border border-slate-800 shadow-glass pointer-events-auto">
          <button
            onClick={() => setMeshDisplayMode('textured')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              meshDisplayMode === 'textured'
                ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Aerial Texture
          </button>
          <button
            onClick={() => setMeshDisplayMode('solid')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              meshDisplayMode === 'solid'
                ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Elevation Hypsometric
          </button>
          <button
            onClick={() => setMeshDisplayMode('wireframe')}
            className={`px-3 py-1 rounded text-xs font-mono transition ${
              meshDisplayMode === 'wireframe'
                ? 'bg-cyan-500 text-navy-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Wireframe Mesh
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Wireframe Overlay Grid Toggle */}
          <button
            onClick={() => setWireframeOverlay(!wireframeOverlay)}
            title="Toggle Wireframe Grid Overlay on Surface"
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition ${
              wireframeOverlay
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid3X3 className="w-3 h-3" />
            <span className="hidden sm:inline">Grid Overlay</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Invert Elevation / Flip Heights Toggle */}
          <button
            onClick={() => setInvertDepth(!invertDepth)}
            title="Invert Elevation Polarity (Flip Rooftops / Terrain Heights)"
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono transition ${
              invertDepth
                ? 'bg-amber-500/30 text-amber-300 border border-amber-400/50 shadow-glow-amber'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpDown className="w-3 h-3" />
            <span>{invertDepth ? 'Heights Flipped' : 'Flip Height'}</span>
          </button>
        </div>

        {/* Right: Height Exaggeration Continuous Slider & Quick Buttons */}
        <div className="flex items-center space-x-3 bg-navy-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-800 shadow-glass pointer-events-auto">
          <div className="flex items-center space-x-2.5">
            <div className="flex items-center space-x-1 text-slate-400">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-400">EXAGGERATION:</span>
            </div>

            {/* Continuous Exaggeration Slider */}
            <input
              type="range"
              min="0.2"
              max="8.0"
              step="0.1"
              value={heightExaggeration}
              onChange={(e) => setHeightExaggeration(parseFloat(e.target.value))}
              className="w-20 sm:w-28 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Height Exaggeration: ${heightExaggeration.toFixed(1)}x`}
            />

            <span className="text-xs font-mono font-bold text-cyan-300 min-w-[36px]">
              {heightExaggeration.toFixed(1)}x
            </span>

            {/* Quick Preset Buttons */}
            <div className="hidden md:flex space-x-1">
              {[0.5, 1.0, 2.0, 4.0].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setHeightExaggeration(ex)}
                  className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition ${
                    Math.abs(heightExaggeration - ex) < 0.05
                      ? 'bg-cyan-500 text-navy-950 font-bold'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {ex}x
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          {/* Scale Bar */}
          <div className="flex items-center space-x-1.5 text-[10px] font-mono text-slate-400">
            <div className="w-10 h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-sm" />
            <span>{isCalibrated ? '50 m' : '50 Units'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
