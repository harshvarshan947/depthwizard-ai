import { PipelineResult } from '../types';

export const getDemoFallbackResult = (presetId: string = 'demo_urban_commercial'): PipelineResult => {
  const isQuarry = presetId === 'demo_suburban_quarry';
  const isCoastal = presetId === 'demo_coastal_facility';

  const title = isQuarry 
    ? 'Open-Pit Topographic Quarry' 
    : isCoastal 
    ? 'Coastal Petrochemical Terminal' 
    : 'Metropolitan CBD & High-Rise Complex';

  const maxH = isQuarry ? 85.0 : isCoastal ? 32.0 : 48.5;
  const avgH = isQuarry ? 34.2 : isCoastal ? 12.4 : 22.8;

  return {
    image_id: presetId,
    filename: `${presetId}.png`,
    image_url: `/demo_assets/${presetId}.png`,
    dimensions: [768, 768],
    depth: {
      image_id: presetId,
      depth_map_url: `/demo_assets/${presetId}_depth_norm.png`,
      normalized_depth_url: `/demo_assets/${presetId}_depth_norm.png`,
      colorized_depth_url: `/demo_assets/${presetId}_height_color.png`,
      processing_time_ms: 320,
      model_name: 'Depth-Anything-V2-ViT-S (Standalone Pre-computation)',
      confidence: 0.95,
      is_demo_fallback: true,
      status_message: 'High-Fidelity Benchmark Terrain Field',
      stats: {
        min_val: 0.02,
        max_val: 0.98,
        mean_val: 0.44,
        std_val: 0.22,
        width: 768,
        height: 768
      }
    },
    height: {
      image_id: presetId,
      min_height: 0.0,
      max_height: maxH,
      average_height: avgH,
      height_range: maxH,
      unit: 'm',
      calibration_status: 'Pre-calibrated 15 cm GSD Nadir',
      height_map_url: `/demo_assets/${presetId}_depth_norm.png`,
      colorized_height_url: `/demo_assets/${presetId}_height_color.png`,
      histogram: [
        { height_range: '0-5m (Ground/Datum)', count: 240, percentage: 24 },
        { height_range: '5-15m (Low Tier)', count: 190, percentage: 19 },
        { height_range: '15-28m (Mid Rise)', count: 320, percentage: 32 },
        { height_range: '28-42m (High Rise)', count: 180, percentage: 18 },
        { height_range: '>42m (Peak Spire)', count: 70, percentage: 7 }
      ],
      stats: {
        min: 0.0,
        max: maxH,
        mean: avgH
      }
    },
    objects: {
      image_id: presetId,
      objects: [
        {
          id: 'obj_cbd_01',
          label: 'Primary Commercial Tower',
          category: 'Commercial High-Rise',
          bbox: [210, 180, 360, 390],
          centroid_2d: [285, 285],
          centroid_3d: [285, 285, maxH],
          estimated_height: maxH,
          height_unit: 'm',
          footprint_area_sqm: 1420.0,
          confidence: 0.96,
          elevation_tier: 'High'
        },
        {
          id: 'obj_cbd_02',
          label: 'Auxiliary Multi-Story Structure',
          category: 'Office Block',
          bbox: [410, 260, 520, 420],
          centroid_2d: [465, 340],
          centroid_3d: [465, 340, 28.4],
          estimated_height: 28.4,
          height_unit: 'm',
          footprint_area_sqm: 860.0,
          confidence: 0.92,
          elevation_tier: 'Medium'
        },
        {
          id: 'obj_cbd_03',
          label: 'Perimeter Infrastructure Complex',
          category: 'Utility Building',
          bbox: [120, 450, 280, 580],
          centroid_2d: [200, 515],
          centroid_3d: [200, 515, 14.5],
          estimated_height: 14.5,
          height_unit: 'm',
          footprint_area_sqm: 1100.0,
          confidence: 0.89,
          elevation_tier: 'Low'
        }
      ],
      total_detected: 3,
      avg_object_height: avgH,
      max_object_height: maxH,
      unit: 'm',
      is_simulated_detector: true,
      detector_model: 'DepthWizard Geospatial Footprint Engine'
    },
    reconstruction: {
      image_id: presetId,
      obj_url: `/outputs/${presetId}_terrain.obj`,
      ply_url: `/outputs/${presetId}_pointcloud.ply`,
      vertices_count: 160 * 160,
      faces_count: (160 - 1) * (160 - 1) * 2,
      bounds: {
        min: [-20, -20, 0],
        max: [20, 20, maxH / 10]
      },
      processing_time_ms: 412
    },
    pipeline_duration_ms: 412,
    calibration: {
      is_calibrated: true,
      camera_altitude_m: 650.0,
      ground_sampling_distance_cm: 15.0,
      reference_height_m: maxH,
      elevation_datum: 'WGS84_EGM96'
    }
  };
};
