import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PipelineResult, SystemHealth, CalibrationParams, MeasurementPoint, ObjectItem } from '../types';
import { api } from '../services/api';

interface AppContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentResult: PipelineResult | null;
  setCurrentResult: (result: PipelineResult | null) => void;
  isLoading: boolean;
  pipelineStep: number;
  pipelineProgress: number;
  pipelineStatusText: string;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  presentationMode: boolean;
  setPresentationMode: (active: boolean) => void;
  flythroughActive: boolean;
  setFlythroughActive: (active: boolean) => void;
  flythroughSpeed: number;
  setFlythroughSpeed: (speed: number) => void;
  meshDisplayMode: 'solid' | 'wireframe' | 'textured';
  setMeshDisplayMode: (mode: 'solid' | 'wireframe' | 'textured') => void;
  heightExaggeration: number;
  setHeightExaggeration: (ex: number) => void;
  depthContrast: number;
  setDepthContrast: (val: number) => void;
  depthScale: number;
  setDepthScale: (val: number) => void;
  invertDepth: boolean;
  setInvertDepth: (val: boolean) => void;
  selectedColormap: string;
  setSelectedColormap: (cmap: string) => void;
  calibration: CalibrationParams;
  updateCalibration: (calib: Partial<CalibrationParams>) => void;
  measurementMode: boolean;
  setMeasurementMode: (active: boolean) => void;
  measurementPoints: MeasurementPoint[];
  addMeasurementPoint: (pt: MeasurementPoint) => void;
  clearMeasurement: () => void;
  systemHealth: SystemHealth | null;
  triggerLiveDemo: (presetId?: string) => Promise<void>;
  processUploadedImage: (imageId: string) => Promise<void>;
}

const defaultCalibration: CalibrationParams = {
  is_calibrated: false,
  camera_altitude_m: 500.0,
  ground_sampling_distance_cm: 15.0,
  reference_height_m: undefined,
  elevation_datum: 'WGS84_EGM96',
  notes: 'Relative mode active: absolute heights require scene calibration'
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [currentResult, setCurrentResult] = useState<PipelineResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineStatusText, setPipelineStatusText] = useState<string>('System Idle');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [flythroughActive, setFlythroughActive] = useState<boolean>(false);
  const [flythroughSpeed, setFlythroughSpeed] = useState<number>(1.0);
  const [meshDisplayMode, setMeshDisplayMode] = useState<'solid' | 'wireframe' | 'textured'>('textured');
  const [heightExaggeration, setHeightExaggeration] = useState<number>(1.0);
  const [depthContrast, setDepthContrast] = useState<number>(1.0);
  const [depthScale, setDepthScale] = useState<number>(1.0);
  const [invertDepth, setInvertDepth] = useState<boolean>(false);
  const [selectedColormap, setSelectedColormap] = useState<string>('turbo');
  const [calibration, setCalibration] = useState<CalibrationParams>(defaultCalibration);
  const [measurementMode, setMeasurementMode] = useState<boolean>(false);
  const [measurementPoints, setMeasurementPoints] = useState<MeasurementPoint[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  // Poll system health initially
  useEffect(() => {
    api.getHealth()
      .then(setSystemHealth)
      .catch((err) => console.warn('Backend not yet reachable:', err));
  }, []);

  // Keyboard shortcut listener for SIH presentation mode (1 = Original, 2 = Depth, 3 = Height, 4 = 3D, 5 = Flythrough, P = Toggle Presentation)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        setPresentationMode((prev) => !prev);
      } else if (e.key === '1') {
        setActiveTab('upload');
      } else if (e.key === '2') {
        setActiveTab('depth');
      } else if (e.key === '3') {
        setActiveTab('height');
      } else if (e.key === '4') {
        setActiveTab('reconstruction');
      } else if (e.key === '5') {
        setActiveTab('flythrough');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateCalibration = (calib: Partial<CalibrationParams>) => {
    setCalibration((prev) => ({ ...prev, ...calib }));
  };

  const addMeasurementPoint = (pt: MeasurementPoint) => {
    setMeasurementPoints((prev) => {
      if (prev.length >= 2) return [pt];
      return [...prev, pt];
    });
  };

  const clearMeasurement = () => {
    setMeasurementPoints([]);
  };

  const simulateRealSteps = async (imageId: string) => {
    setIsLoading(true);
    setPipelineStep(1);
    setPipelineProgress(15);
    setPipelineStatusText('STEP 01: Image Preprocessing & Multi-Spectral Harmonization...');
    await new Promise((r) => setTimeout(r, 280));

    setPipelineStep(2);
    setPipelineProgress(35);
    setPipelineStatusText('STEP 02: AI Depth Estimation via Depth Anything V2 Foundation Model...');
    await new Promise((r) => setTimeout(r, 380));

    setPipelineStep(3);
    setPipelineProgress(55);
    setPipelineStatusText('STEP 03: Monocular Depth Field Normalization & Gradient Calibration...');
    await new Promise((r) => setTimeout(r, 260));

    setPipelineStep(4);
    setPipelineProgress(70);
    setPipelineStatusText('STEP 04: Elevation & Height Model Matrix Reconstruction...');
    await new Promise((r) => setTimeout(r, 280));

    setPipelineStep(5);
    setPipelineProgress(85);
    setPipelineStatusText('STEP 05: Morphological Structural Object Detection & Elevation Tiers...');
    await new Promise((r) => setTimeout(r, 260));

    setPipelineStep(6);
    setPipelineProgress(95);
    setPipelineStatusText('STEP 06: Generating Volumetric 3D Height-Field Mesh & Point Cloud...');
    
    // Call backend pipeline
    const res = await api.runPipeline({
      image_id: imageId,
      contrast: depthContrast,
      scale: depthScale,
      invert: invertDepth,
      colormap: selectedColormap,
      use_ai: true,
      is_calibrated: calibration.is_calibrated,
      camera_altitude_m: calibration.camera_altitude_m,
      ground_sampling_distance_cm: calibration.ground_sampling_distance_cm,
      reference_height_m: calibration.reference_height_m,
      exaggeration: heightExaggeration
    });

    setPipelineStep(7);
    setPipelineProgress(100);
    setPipelineStatusText('STEP 07: 3D Scene Spatial Optimization & LOD Buffering Complete.');
    await new Promise((r) => setTimeout(r, 200));

    setCurrentResult(res);
    setIsLoading(false);
    return res;
  };

  const triggerLiveDemo = async (presetId: string = 'demo_urban_commercial') => {
    try {
      await simulateRealSteps(presetId);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error('Demo execution error:', err);
      setIsLoading(false);
      setPipelineStatusText(`Execution Notice: ${err.message}`);
    }
  };

  const processUploadedImage = async (imageId: string) => {
    try {
      await simulateRealSteps(imageId);
      setActiveTab('dashboard');
    } catch (err: any) {
      console.error('Processing error:', err);
      setIsLoading(false);
      setPipelineStatusText(`Processing Error: ${err.message}`);
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentResult,
        setCurrentResult,
        isLoading,
        pipelineStep,
        pipelineProgress,
        pipelineStatusText,
        selectedObjectId,
        setSelectedObjectId,
        presentationMode,
        setPresentationMode,
        flythroughActive,
        setFlythroughActive,
        flythroughSpeed,
        setFlythroughSpeed,
        meshDisplayMode,
        setMeshDisplayMode,
        heightExaggeration,
        setHeightExaggeration,
        depthContrast,
        setDepthContrast,
        depthScale,
        setDepthScale,
        invertDepth,
        setInvertDepth,
        selectedColormap,
        setSelectedColormap,
        calibration,
        updateCalibration,
        measurementMode,
        setMeasurementMode,
        measurementPoints,
        addMeasurementPoint,
        clearMeasurement,
        systemHealth,
        triggerLiveDemo,
        processUploadedImage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
