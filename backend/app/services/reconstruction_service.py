import os
import time
import numpy as np
from PIL import Image
from app.models.schemas import MeshReconstructResponse, MeshReconstructRequest

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "outputs"))

class ReconstructionService:
    @staticmethod
    def generate_mesh(req: MeshReconstructRequest) -> MeshReconstructResponse:
        start_time = time.time()
        image_id = req.image_id
        
        height_npy_path = os.path.join(OUTPUT_DIR, f"{image_id}_height_field.npy")
        if not os.path.exists(height_npy_path):
            raw_npy_path = os.path.join(OUTPUT_DIR, f"{image_id}_depth_raw.npy")
            if not os.path.exists(raw_npy_path):
                raise FileNotFoundError(f"Height/Depth data for '{image_id}' not found.")
            height_field = np.load(raw_npy_path) * 100.0
        else:
            height_field = np.load(height_npy_path)
            
        # Downsample grid for export efficiency
        step = max(req.resolution_downsample, 2)
        sampled_height = height_field[::step, ::step]
        rows, cols = sampled_height.shape
        
        # World dimensions [-50 to 50 in X and Z, Y is height]
        xs = np.linspace(-50.0, 50.0, cols, dtype=np.float32)
        zs = np.linspace(-50.0, 50.0, rows, dtype=np.float32)
        
        # Normalize Y height scale
        max_h = np.max(sampled_height)
        if max_h > 0:
            ys = (sampled_height / max_h) * 20.0 * req.height_exaggeration
        else:
            ys = sampled_height * 0.2 * req.height_exaggeration

        # Generate OBJ file
        obj_filename = f"{image_id}_terrain.obj"
        obj_path = os.path.join(OUTPUT_DIR, obj_filename)
        
        with open(obj_path, "w") as f:
            f.write(f"# DepthWizard AI 3D Terrain Reconstruction\n")
            f.write(f"# Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"# Grid: {cols}x{rows} = {cols*rows} vertices\n")
            f.write("o TerrainMesh\n")
            
            # Vertices and UVs
            for r in range(rows):
                for c in range(cols):
                    f.write(f"v {xs[c]:.4f} {ys[r, c]:.4f} {zs[r]:.4f}\n")
                    
            for r in range(rows):
                for c in range(cols):
                    u = c / (cols - 1)
                    v = 1.0 - (r / (rows - 1))
                    f.write(f"vt {u:.4f} {v:.4f}\n")
                    
            # Faces (triangles)
            for r in range(rows - 1):
                for c in range(cols - 1):
                    # 1-based indexing
                    i1 = r * cols + c + 1
                    i2 = r * cols + (c + 1) + 1
                    i3 = (r + 1) * cols + (c + 1) + 1
                    i4 = (r + 1) * cols + c + 1
                    # Face with texture coordinates (f v1/vt1 v2/vt2 v3/vt3)
                    f.write(f"f {i1}/{i1} {i2}/{i2} {i3}/{i3}\n")
                    f.write(f"f {i1}/{i1} {i3}/{i3} {i4}/{i4}\n")

        # Generate PLY Point Cloud file
        ply_filename = f"{image_id}_pointcloud.ply"
        ply_path = os.path.join(OUTPUT_DIR, ply_filename)
        
        total_verts = rows * cols
        total_faces = (rows - 1) * (cols - 1) * 2
        
        with open(ply_path, "w") as f:
            f.write("ply\n")
            f.write("format ascii 1.0\n")
            f.write(f"element vertex {total_verts}\n")
            f.write("property float x\n")
            f.write("property float y\n")
            f.write("property float z\n")
            f.write("property uchar red\n")
            f.write("property uchar green\n")
            f.write("property uchar blue\n")
            f.write("end_header\n")
            
            for r in range(rows):
                for c in range(cols):
                    norm_h = min(max(ys[r, c] / (20.0 * req.height_exaggeration + 1e-4), 0.0), 1.0)
                    # Color ramp for point cloud: cyan to blue to magenta
                    red = int(30 + norm_h * 220)
                    green = int(180 * (1.0 - norm_h * 0.5))
                    blue = int(255 - norm_h * 50)
                    f.write(f"{xs[c]:.3f} {ys[r, c]:.3f} {zs[r]:.3f} {red} {green} {blue}\n")

        proc_time = round((time.time() - start_time) * 1000, 2)
        
        bounds = {
            "min": [float(xs.min()), float(ys.min()), float(zs.min())],
            "max": [float(xs.max()), float(ys.max()), float(zs.max())]
        }
        
        return MeshReconstructResponse(
            image_id=image_id,
            obj_url=f"/outputs/{obj_filename}",
            ply_url=f"/outputs/{ply_filename}",
            vertices_count=total_verts,
            faces_count=total_faces,
            bounds=bounds,
            processing_time_ms=proc_time
        )
