from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CalibrationParams(BaseModel):
    is_calibrated: bool = False
    camera_altitude_m: Optional[float] = Field(default=500.0, description="Flight/Drone/Satellite altitude above ground in meters")
    ground_sampling_distance_cm: Optional[float] = Field(default=15.0, description="Ground sampling distance in cm/pixel")
    reference_height_m: Optional[float] = Field(default=None, description="Known reference structure height in meters")
    reference_distance_m: Optional[float] = Field(default=None, description="Known distance between two landmark points")
    elevation_datum: str = Field(default="WGS84_EGM96", description="Geodetic vertical datum reference")
    notes: Optional[str] = "Relative mode active: absolute heights require scene calibration"

class DepthRequest(BaseModel):
    image_id: str
    contrast: float = 1.0
    scale: float = 1.0
    invert: bool = False
    colormap: str = "turbo"
    use_ai_model: bool = True

class DepthResponse(BaseModel):
    image_id: str
    depth_map_url: str
    normalized_depth_url: str
    colorized_depth_url: str
    processing_time_ms: float
    model_name: str
    confidence: float
    is_demo_fallback: bool
    status_message: str
    stats: Dict[str, float]

class HeightRequest(BaseModel):
    image_id: str
    calibration: Optional[CalibrationParams] = None
    exaggeration: float = 1.0
    colormap: str = "inferno"

class HeightHistogramBin(BaseModel):
    height_range: str
    count: int
    percentage: float

class HeightResponse(BaseModel):
    image_id: str
    min_height: float
    max_height: float
    average_height: float
    height_range: float
    unit: str
    calibration_status: str
    height_map_url: str
    colorized_height_url: str
    histogram: List[HeightHistogramBin]
    stats: Dict[str, Any]

class ObjectItem(BaseModel):
    id: str
    label: str
    category: str
    bbox: List[int] = Field(description="[ymin, xmin, ymax, xmax] in pixel coordinates")
    centroid_2d: List[int]
    centroid_3d: List[float]
    estimated_height: float
    height_unit: str
    footprint_area_sqm: float
    confidence: float
    elevation_tier: str  # 'Low', 'Medium', 'High'

class ObjectAnalysisResponse(BaseModel):
    image_id: str
    objects: List[ObjectItem]
    total_detected: int
    avg_object_height: float
    max_object_height: float
    unit: str
    is_simulated_detector: bool
    detector_model: str

class MeshReconstructRequest(BaseModel):
    image_id: str
    resolution_downsample: int = 2  # 1 = full, 2 = 2x downsampled for web speed
    height_exaggeration: float = 1.0
    smooth_iterations: int = 1
    generate_point_cloud: bool = True

class MeshReconstructResponse(BaseModel):
    image_id: str
    obj_url: str
    ply_url: str
    vertices_count: int
    faces_count: int
    bounds: Dict[str, List[float]]
    processing_time_ms: float

class ExportRequest(BaseModel):
    image_id: str
    format: str  # 'depth_png', 'height_png', 'obj', 'ply', 'json', 'report'

class PipelineProcessResponse(BaseModel):
    image_id: str
    filename: str
    image_url: str
    dimensions: List[int]
    depth: DepthResponse
    height: HeightResponse
    objects: ObjectAnalysisResponse
    reconstruction: MeshReconstructResponse
    pipeline_duration_ms: float
    calibration: CalibrationParams
