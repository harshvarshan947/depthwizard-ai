export interface CalibrationParams {
  is_calibrated: boolean;
  camera_altitude_m: number;
  ground_sampling_distance_cm: number;
  reference_height_m?: number;
  reference_distance_m?: number;
  elevation_datum: string;
  notes?: string;
}

export interface DepthStats {
  min_val: number;
  max_val: number;
  mean_val: number;
  std_val: number;
  width: number;
  height: number;
}

export interface DepthResponse {
  image_id: string;
  depth_map_url: string;
  normalized_depth_url: string;
  colorized_depth_url: string;
  processing_time_ms: number;
  model_name: string;
  confidence: number;
  is_demo_fallback: boolean;
  status_message: string;
  stats: DepthStats;
}

export interface HeightHistogramBin {
  height_range: string;
  count: number;
  percentage: number;
}

export interface HeightResponse {
  image_id: string;
  min_height: number;
  max_height: number;
  average_height: number;
  height_range: number;
  unit: string;
  calibration_status: string;
  height_map_url: string;
  colorized_height_url: string;
  histogram: HeightHistogramBin[];
  stats: Record<string, any>;
}

export interface ObjectItem {
  id: string;
  label: string;
  category: string;
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  centroid_2d: [number, number];
  centroid_3d: [number, number, number];
  estimated_height: number;
  height_unit: string;
  footprint_area_sqm: number;
  confidence: number;
  elevation_tier: string;
}

export interface ObjectAnalysisResponse {
  image_id: string;
  objects: ObjectItem[];
  total_detected: number;
  avg_object_height: number;
  max_object_height: number;
  unit: string;
  is_simulated_detector: boolean;
  detector_model: string;
}

export interface MeshReconstructResponse {
  image_id: string;
  obj_url: string;
  ply_url: string;
  vertices_count: number;
  faces_count: number;
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  processing_time_ms: number;
}

export interface PipelineResult {
  image_id: string;
  filename: string;
  image_url: string;
  dimensions: [number, number];
  depth: DepthResponse;
  height: HeightResponse;
  objects: ObjectAnalysisResponse;
  reconstruction: MeshReconstructResponse;
  pipeline_duration_ms: number;
  calibration: CalibrationParams;
}

export interface DemoPreset {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  type: string;
  default_altitude: number;
  default_gsd: number;
}

export interface SystemHealth {
  status: string;
  system: string;
  team: string;
  ai_model: {
    engine: string;
    has_torch: boolean;
    has_weights: boolean;
    device: string;
    weights_path: string | null;
    active_mode: string;
    ready: boolean;
  };
  storage: {
    uploads: boolean;
    outputs: boolean;
    demo_assets: boolean;
  };
  webgl_recommended: boolean;
  timestamp: number;
}

export interface MeasurementPoint {
  x: number;
  y: number;
  z: number;
}
