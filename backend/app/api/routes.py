import os
import uuid
import time
import shutil
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from PIL import Image

from app.models.schemas import (
    DepthRequest, DepthResponse,
    HeightRequest, HeightResponse,
    ObjectAnalysisResponse,
    MeshReconstructRequest, MeshReconstructResponse,
    CalibrationParams, PipelineProcessResponse
)
from app.services.depth_service import DepthService
from app.services.height_service import HeightService
from app.services.object_service import ObjectService
from app.services.reconstruction_service import ReconstructionService
from app.services.report_service import ReportService
from app.inference.depth_anything import get_depth_model_status

router = APIRouter(prefix="/api")

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))
DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_assets"))

# In-memory session cache for fast pipeline results
_CACHE_RESULTS = {}

@router.get("/health")
def get_health():
    model_status = get_depth_model_status()
    return {
        "status": "online",
        "system": "DEPTHWIZARD AI Core v2.4",
        "team": "PARALLAX",
        "ai_model": model_status,
        "storage": {
            "uploads": os.path.exists(UPLOAD_DIR),
            "outputs": os.path.exists(OUTPUT_DIR),
            "demo_assets": os.path.exists(DEMO_DIR)
        },
        "webgl_recommended": True,
        "timestamp": time.time()
    }

@router.get("/demos")
def get_demos():
    return {
        "demos": [
            {
                "id": "demo_urban_commercial",
                "title": "Metropolitan CBD & High-Rise Complex",
                "description": "Dense high-rise corporate towers with rooftop helipads, multilevel structures, and sharp shadow extrusions.",
                "thumbnail_url": "/demo_assets/demo_urban_commercial.png",
                "type": "Aerial EO 15cm GSD",
                "default_altitude": 650.0,
                "default_gsd": 15.0
            },
            {
                "id": "demo_suburban_quarry",
                "title": "Open-Pit Topographic Quarry",
                "description": "Complex stepped contour terraces, earthwork benches, excavation equipment, and gradual elevation drops.",
                "thumbnail_url": "/demo_assets/demo_suburban_quarry.png",
                "type": "Terrain Elevation Model",
                "default_altitude": 450.0,
                "default_gsd": 12.0
            },
            {
                "id": "demo_coastal_facility",
                "title": "Deepwater Marine Port & Container Terminal",
                "description": "Zero-datum sea waterline, dock bulkhead wall, and organized colored container stacks of discrete heights.",
                "thumbnail_url": "/demo_assets/demo_coastal_facility.png",
                "type": "Maritime Logistics EO",
                "default_altitude": 550.0,
                "default_gsd": 20.0
            }
        ]
    }

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # Validate extension
    filename = file.filename or "upload.png"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{ext}'. Supported: JPG, PNG, WEBP, TIFF.")

    image_id = f"img_{uuid.uuid4().hex[:12]}"
    dest_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    
    try:
        # Read and open with Pillow to validate
        contents = await file.read()
        if len(contents) > 25 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File size exceeds maximum 25 MB limit.")
            
        import io
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        # Resize if huge to prevent memory exhaustion
        if max(img.width, img.height) > 1600:
            img.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        img.save(dest_path, format="PNG")
        
        return {
            "image_id": image_id,
            "filename": filename,
            "image_url": f"/uploads/{image_id}.png",
            "resolution": [img.width, img.height],
            "file_size_kb": round(len(contents) / 1024, 1),
            "format": "PNG",
            "status": "ready"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process uploaded image: {str(e)}")

@router.post("/depth", response_model=DepthResponse)
def estimate_depth_endpoint(req: DepthRequest):
    try:
        return DepthService.process_depth(
            image_id=req.image_id,
            contrast=req.contrast,
            scale=req.scale,
            invert=req.invert,
            colormap=req.colormap,
            use_ai=req.use_ai_model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Depth estimation failed: {str(e)}")

@router.post("/height", response_model=HeightResponse)
def calculate_height_endpoint(req: HeightRequest):
    try:
        return HeightService.calculate_height(
            image_id=req.image_id,
            calibration=req.calibration,
            exaggeration=req.exaggeration,
            colormap=req.colormap
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Height calculation failed: {str(e)}")

@router.post("/objects", response_model=ObjectAnalysisResponse)
def detect_objects_endpoint(data: dict):
    image_id = data.get("image_id")
    if not image_id:
        raise HTTPException(status_code=400, detail="image_id is required")
    try:
        return ObjectService.detect_objects(image_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Object analysis failed: {str(e)}")

@router.post("/reconstruct", response_model=MeshReconstructResponse)
def reconstruct_mesh_endpoint(req: MeshReconstructRequest):
    try:
        return ReconstructionService.generate_mesh(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"3D Reconstruction failed: {str(e)}")

def execute_pipeline(
    image_id: str,
    contrast: float = 1.0,
    scale: float = 1.0,
    invert: bool = False,
    colormap: str = "turbo",
    use_ai: bool = True,
    is_calibrated: bool = False,
    camera_altitude_m: float = 500.0,
    ground_sampling_distance_cm: float = 15.0,
    reference_height_m: Optional[float] = None,
    exaggeration: float = 1.0
) -> PipelineProcessResponse:
    """Core 7-step pipeline executor, callable directly by Python or via HTTP."""
    t0 = time.time()
    
    # 1. Resolve image source
    img_path = os.path.join(UPLOAD_DIR, f"{image_id}.png")
    img_url = f"/uploads/{image_id}.png"
    if not os.path.exists(img_path):
        img_path = os.path.join(UPLOAD_DIR, f"{image_id}.jpg")
        img_url = f"/uploads/{image_id}.jpg"
    if not os.path.exists(img_path):
        demo_path = os.path.join(DEMO_DIR, f"{image_id}.png")
        if os.path.exists(demo_path):
            img_path = demo_path
            img_url = f"/demo_assets/{image_id}.png"
        else:
            raise HTTPException(status_code=404, detail=f"Image ID '{image_id}' not found.")
            
    img = Image.open(img_path)
    dimensions = [img.width, img.height]
    
    # Calibration config
    calibration = CalibrationParams(
        is_calibrated=is_calibrated,
        camera_altitude_m=camera_altitude_m,
        ground_sampling_distance_cm=ground_sampling_distance_cm,
        reference_height_m=reference_height_m
    )

    # 2. Depth
    depth_res = DepthService.process_depth(
        image_id=image_id,
        contrast=contrast,
        scale=scale,
        invert=invert,
        colormap=colormap,
        use_ai=use_ai
    )
    
    # 3. Height
    height_res = HeightService.calculate_height(
        image_id=image_id,
        calibration=calibration,
        exaggeration=exaggeration,
        colormap="inferno"
    )
    
    # 4. Objects
    obj_res = ObjectService.detect_objects(image_id)
    
    # 5. Mesh
    mesh_res = ReconstructionService.generate_mesh(MeshReconstructRequest(
        image_id=image_id,
        resolution_downsample=4,
        height_exaggeration=exaggeration
    ))
    
    total_time = round((time.time() - t0) * 1000, 1)
    
    response_payload = PipelineProcessResponse(
        image_id=image_id,
        filename=os.path.basename(img_path),
        image_url=img_url,
        dimensions=dimensions,
        depth=depth_res,
        height=height_res,
        objects=obj_res,
        reconstruction=mesh_res,
        pipeline_duration_ms=total_time,
        calibration=calibration
    )
    
    # Cache for instant route transitions
    _CACHE_RESULTS[image_id] = response_payload.model_dump()
    
    # Pre-generate markdown report
    ReportService.generate_markdown_report(_CACHE_RESULTS[image_id])
    
    return response_payload

@router.post("/process", response_model=PipelineProcessResponse)
def run_full_pipeline(
    image_id: str = Form(...),
    contrast: float = Form(1.0),
    scale: float = Form(1.0),
    invert: bool = Form(False),
    colormap: str = Form("turbo"),
    use_ai: bool = Form(True),
    is_calibrated: bool = Form(False),
    camera_altitude_m: float = Form(500.0),
    ground_sampling_distance_cm: float = Form(15.0),
    reference_height_m: Optional[float] = Form(None),
    exaggeration: float = Form(1.0)
):
    """
    Executes the 7-step presentation pipeline in a single synchronized call:
    STEP 01 Image Preprocessing
    STEP 02 AI Depth Estimation
    STEP 03 Depth Normalization
    STEP 04 Height Reconstruction
    STEP 05 Object Analysis
    STEP 06 3D Mesh Generation
    STEP 07 Scene Optimization
    """
    return execute_pipeline(
        image_id=image_id,
        contrast=contrast,
        scale=scale,
        invert=invert,
        colormap=colormap,
        use_ai=use_ai,
        is_calibrated=is_calibrated,
        camera_altitude_m=camera_altitude_m,
        ground_sampling_distance_cm=ground_sampling_distance_cm,
        reference_height_m=reference_height_m,
        exaggeration=exaggeration
    )

@router.get("/result/{image_id}")
def get_cached_result(image_id: str):
    if image_id in _CACHE_RESULTS:
        return _CACHE_RESULTS[image_id]
        
    # Check if files exist on disk
    norm_depth = os.path.join(OUTPUT_DIR, f"{image_id}_depth_norm.png")
    if os.path.exists(norm_depth):
        # Regenerate payload
        return run_full_pipeline(image_id=image_id)
        
    raise HTTPException(status_code=404, detail="No processing result found for this image ID.")

@router.get("/report/{image_id}")
def download_report(image_id: str):
    report_path = os.path.join(OUTPUT_DIR, f"{image_id}_report.md")
    if not os.path.exists(report_path):
        # Generate on the fly if cached
        if image_id in _CACHE_RESULTS:
            ReportService.generate_markdown_report(_CACHE_RESULTS[image_id])
        else:
            raise HTTPException(status_code=404, detail="Analysis report not found.")
            
    return FileResponse(
        report_path,
        media_type="text/markdown",
        filename=f"DepthWizard_Report_{image_id[:8]}.md"
    )

@router.get("/export/{image_id}/{format}")
def export_asset(image_id: str, format: str):
    format = format.lower()
    if format == "depth":
        path = os.path.join(OUTPUT_DIR, f"{image_id}_depth_norm.png")
        return FileResponse(path, media_type="image/png", filename=f"{image_id}_depth.png")
    elif format == "height":
        path = os.path.join(OUTPUT_DIR, f"{image_id}_height_color.png")
        return FileResponse(path, media_type="image/png", filename=f"{image_id}_height_map.png")
    elif format == "obj":
        path = os.path.join(OUTPUT_DIR, f"{image_id}_terrain.obj")
        return FileResponse(path, media_type="text/plain", filename=f"{image_id}_terrain.obj")
    elif format == "ply":
        path = os.path.join(OUTPUT_DIR, f"{image_id}_pointcloud.ply")
        return FileResponse(path, media_type="application/octet-stream", filename=f"{image_id}_pointcloud.ply")
    elif format == "json":
        if image_id in _CACHE_RESULTS:
            return JSONResponse(content=_CACHE_RESULTS[image_id])
        path = os.path.join(OUTPUT_DIR, f"{image_id}_depth_raw.npy")
        if os.path.exists(path):
            res = execute_pipeline(image_id=image_id)
            return JSONResponse(content=res.model_dump())
        raise HTTPException(status_code=404, detail="JSON result not available.")
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported export format '{format}'")
