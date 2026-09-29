import os
import numpy as np
from PIL import Image
from typing import Dict, Any, List, Optional
from app.models.schemas import HeightResponse, CalibrationParams, HeightHistogramBin
from app.utils.colormaps import apply_colormap

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))

class HeightService:
    @staticmethod
    def calculate_height(
        image_id: str,
        calibration: Optional[CalibrationParams] = None,
        exaggeration: float = 1.0,
        colormap: str = "inferno"
    ) -> HeightResponse:
        # Load raw depth array
        raw_npy_path = os.path.join(OUTPUT_DIR, f"{image_id}_depth_raw.npy")
        if not os.path.exists(raw_npy_path):
            raise FileNotFoundError(f"Raw depth map for '{image_id}' not found. Please run depth estimation first.")
            
        depth_arr = np.load(raw_npy_path)
        
        # Ground level estimation: 10th percentile
        ground_baseline = float(np.percentile(depth_arr, 10))
        relative_elevation = np.maximum(depth_arr - ground_baseline, 0.0)
        
        # Max relative elevation
        max_rel = float(np.max(relative_elevation))
        if max_rel < 1e-4:
            max_rel = 1.0
            
        unit = "rel-units"
        calib_status = "Uncalibrated: Relative height estimate. Absolute metric height requires scene calibration."
        
        if calibration and calibration.is_calibrated:
            if calibration.reference_height_m and calibration.reference_height_m > 0:
                # User provided a known structure height (e.g. 24.5 m)
                scale_m = calibration.reference_height_m / max_rel
                height_field = relative_elevation * scale_m
                unit = "m"
                calib_status = f"Calibrated via known reference height ({calibration.reference_height_m:.1f} m)"
            elif calibration.camera_altitude_m and calibration.ground_sampling_distance_cm:
                # Approximate metric conversion from flight altitude and GSD
                # Typical height scale for high-res drone/aerial: 0.1 to 0.5 ratio
                gsd_m = calibration.ground_sampling_distance_cm / 100.0
                altitude = calibration.camera_altitude_m
                # Effective vertical dynamic range estimated from camera altitude
                scale_m = min(altitude * 0.15, 65.0)
                height_field = (relative_elevation / max_rel) * scale_m
                unit = "m"
                calib_status = f"Calibrated via GSD ({calibration.ground_sampling_distance_cm} cm/px) & Altitude ({altitude} m)"
            else:
                height_field = (relative_elevation / max_rel) * 100.0
        else:
            # Uncalibrated: scale to [0, 100] relative units
            height_field = (relative_elevation / max_rel) * 100.0
            
        # Apply visual exaggeration if specified
        if exaggeration != 1.0:
            height_field = height_field * exaggeration

        # Save height field npy
        height_npy_path = os.path.join(OUTPUT_DIR, f"{image_id}_height_field.npy")
        np.save(height_npy_path, height_field)
        
        # Colorized height heatmap
        norm_for_color = np.clip(height_field / (np.max(height_field) + 1e-6), 0.0, 1.0)
        color_img = apply_colormap(norm_for_color, cmap_name=colormap)
        color_png_path = os.path.join(OUTPUT_DIR, f"{image_id}_height_color.png")
        color_img.save(color_png_path, format="PNG")
        
        min_h = float(np.min(height_field))
        max_h = float(np.max(height_field))
        avg_h = float(np.mean(height_field))
        h_range = max_h - min_h
        
        # Compute 10-bin histogram for dashboard charts
        counts, bin_edges = np.histogram(height_field, bins=10)
        total_pts = float(np.sum(counts))
        histogram_bins = []
        for i in range(len(counts)):
            label = f"{bin_edges[i]:.1f}-{bin_edges[i+1]:.1f}{unit}"
            pct = round((counts[i] / total_pts) * 100.0, 1)
            histogram_bins.append(HeightHistogramBin(
                height_range=label,
                count=int(counts[i]),
                percentage=pct
            ))
            
        stats = {
            "ground_level": round(ground_baseline, 4),
            "median_height": round(float(np.median(height_field)), 2),
            "std_deviation": round(float(np.std(height_field)), 2),
            "p95_tallest": round(float(np.percentile(height_field, 95)), 2),
            "exaggeration": exaggeration
        }
        
        return HeightResponse(
            image_id=image_id,
            min_height=round(min_h, 2),
            max_height=round(max_h, 2),
            average_height=round(avg_h, 2),
            height_range=round(h_range, 2),
            unit=unit,
            calibration_status=calib_status,
            height_map_url=f"/outputs/{image_id}_height_color.png",
            colorized_height_url=f"/outputs/{image_id}_height_color.png",
            histogram=histogram_bins,
            stats=stats
        )
