import os
import json
import time
from typing import Dict, Any

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))

class ReportService:
    @staticmethod
    def generate_markdown_report(data: Dict[str, Any]) -> str:
        image_id = data.get("image_id", "UNKNOWN")
        filename = data.get("filename", f"{image_id}.png")
        dims = data.get("dimensions", [768, 768])
        depth = data.get("depth", {})
        height = data.get("height", {})
        objects = data.get("objects", {})
        recon = data.get("reconstruction", {})
        calib = data.get("calibration", {})
        pipeline_time = data.get("pipeline_duration_ms", 1250)
        
        calib_active = calib.get("is_calibrated", False)
        calib_text = "Calibrated (Ground Reference Metric)" if calib_active else "Relative / Uncalibrated (Reference Anchor Required)"
        unit = height.get("unit", "rel-units")
        
        obj_list = objects.get("objects", [])
        obj_table_rows = ""
        for o in obj_list:
            obj_table_rows += f"| {o.get('id')} | {o.get('label')} | {o.get('category')} | {o.get('estimated_height')} {unit} | {int(o.get('confidence', 0.85)*100)}% | {o.get('elevation_tier')} |\n"

        report_md = f"""# DEPTHWIZARD AI — GEOSPATIAL INTELLIGENCE REPORT
**Problem Statement:** Single-View Height Estimation & 3D Flythrough  
**Team:** PARALLAX | Smart India Hackathon  
**Generated On:** {time.strftime('%Y-%m-%d %H:%M:%S UTC')}  
**Report ID:** DW-{image_id[:8].upper()}

---

## 1. Executive Summary
DEPTHWIZARD AI transforms single-perspective aerial/satellite electro-optical (EO) imagery into high-resolution 3D volumetric surfaces, relative height fields, and navigable first-person flythrough reconstructions.

| Parameter | Value |
| :--- | :--- |
| **Source Image** | `{filename}` |
| **Sensor Footprint Resolution** | {dims[0]} × {dims[1]} px |
| **Pipeline Latency** | {pipeline_time:.1f} ms |
| **Depth Engine** | {depth.get('model_name', 'Depth Anything V2')} |
| **Engine Confidence** | {int(depth.get('confidence', 0.92)*100)}% |
| **Calibration Status** | {calib_text} |
| **Total Structures Identified** | {objects.get('total_detected', len(obj_list))} |

---

## 2. Elevation & Height Field Metrics
The relative depth distribution was normalized and converted to elevation estimates.

- **Maximum Surface Elevation:** `{height.get('max_height', 0.0)} {unit}`
- **Mean Terrain Elevation:** `{height.get('average_height', 0.0)} {unit}`
- **Minimum Base Elevation:** `{height.get('min_height', 0.0)} {unit}`
- **Dynamic Height Range:** `{height.get('height_range', 0.0)} {unit}`
- **Vertical Datum Reference:** `{calib.get('elevation_datum', 'WGS84_EGM96')}`

---

## 3. Structural Object Detection Inventory
The following elevated structural targets were segmented and analyzed:

| Object ID | Descriptor | Classification | Estimated Height | Confidence | Elevation Tier |
| :--- | :--- | :--- | :--- | :--- | :--- |
{obj_table_rows}

---

## 4. 3D Volumetric Mesh & Point Cloud Repertoire
- **Reconstructed Mesh Faces:** {recon.get('faces_count', 0):,} triangles
- **Discrete 3D Vertex Count:** {recon.get('vertices_count', 0):,} spatial nodes
- **Export Standards Supported:** Wavefront OBJ, Stanford PLY Point Cloud, GLTF 2.0 / GLB, 16-Bit Grayscale GeoTIFF / PNG.

---

## 5. Scientific Honesty & Limitations Disclosure
> **IMPORTANT REGULATORY & ENGINEERING NOTICE**  
> Monocular depth estimation maps single 2D projection rays to relative depth representations. In the absence of multi-view stereopsis, LiDAR point constraints, or rigorous Ground Sampling Distance (GSD) calibration, all height values represent **relative mathematical estimates**. These values should not be treated as survey-grade or legal cadastral measurements without ground-truth calibration.

---
*DepthWizard AI by Team PARALLAX. Built for Smart India Hackathon.*
"""
        # Save to outputs
        report_path = os.path.join(OUTPUT_DIR, f"{image_id}_report.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write(report_md)
            
        return report_md
