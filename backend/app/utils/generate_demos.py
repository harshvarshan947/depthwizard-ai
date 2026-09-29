import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from app.inference.algorithmic_depth import generate_procedural_aerial_demo, compute_aerial_gradient_depth

DEMO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "demo_assets"))
os.makedirs(DEMO_DIR, exist_ok=True)

def generate_demo_assets():
    """Generates 3 rich built-in aerial images with pre-computed depth maps for instant offline presentation."""
    # 1. Urban Commercial
    print("Generating demo asset 1: urban_commercial...")
    img1, depth1 = generate_procedural_aerial_demo(scenario="urban_commercial", width=768, height=768)
    p1 = os.path.join(DEMO_DIR, "demo_urban_commercial.png")
    d1 = os.path.join(DEMO_DIR, "demo_urban_commercial_depth.npy")
    img1.save(p1)
    np.save(d1, depth1)

    # 2. Topographical Open Quarry / Terrain
    print("Generating demo asset 2: suburban_quarry...")
    np.random.seed(88)
    w, h = 768, 768
    rgb2 = np.zeros((h, w, 3), dtype=np.uint8)
    depth2 = np.zeros((h, w), dtype=np.float32)
    
    # Base rocky terrain
    rgb2[:, :] = [145, 130, 115]
    y_g, x_g = np.mgrid[0:h, 0:w]
    # Stepped pit quarry
    dist_center = np.sqrt((x_g - w/2)**2 + (y_g - h/2)**2)
    pit_depth = np.clip(1.0 - (dist_center / 320.0), 0.0, 1.0)
    # Terraces (stepped benches)
    terraces = np.floor(pit_depth * 6.0) / 6.0
    depth2 = 0.95 - (terraces * 0.75) + 0.05 * np.sin(x_g / 25.0)
    
    # Color shading based on depth
    shade = (depth2 * 180 + 40).astype(np.uint8)
    rgb2[:, :, 0] = np.clip(shade + 20, 0, 255)
    rgb2[:, :, 1] = np.clip(shade, 0, 255)
    rgb2[:, :, 2] = np.clip(shade - 20, 0, 255)
    
    # Mining trucks / excavator depots
    for ty, tx in [(280, 310), (380, 420), (450, 320)]:
        rgb2[ty:ty+14, tx:tx+22] = [230, 190, 20]  # Yellow haul trucks
        depth2[ty:ty+14, tx:tx+22] += 0.08
        
    img2 = Image.fromarray(rgb2)
    p2 = os.path.join(DEMO_DIR, "demo_suburban_quarry.png")
    d2 = os.path.join(DEMO_DIR, "demo_suburban_quarry_depth.npy")
    img2.save(p2)
    np.save(d2, depth2)

    # 3. Coastal Port & Logistics
    print("Generating demo asset 3: coastal_facility...")
    rgb3 = np.zeros((h, w, 3), dtype=np.uint8)
    depth3 = np.zeros((h, w), dtype=np.float32)
    
    # Left half: deep ocean water (flat, 0 elevation)
    rgb3[:, :280] = [24, 52, 78]
    depth3[:, :280] = 0.01
    
    # Pier / dock bulkhead
    rgb3[:, 278:284] = [220, 220, 220]
    
    # Right half: port logistics terminal (asphalt)
    rgb3[:, 284:] = [70, 75, 80]
    depth3[:, 284:] = 0.15
    
    # Stacks of colorful shipping containers
    container_colors = [
        [180, 40, 40], [30, 80, 160], [210, 140, 30], [40, 130, 60]
    ]
    for row_y in range(80, 680, 65):
        for col_x in range(320, 700, 50):
            c_color = container_colors[(row_y + col_x) % len(container_colors)]
            c_height = 0.35 + 0.10 * ((row_y * col_x) % 4)
            rgb3[row_y:row_y+45, col_x:col_x+35] = c_color
            depth3[row_y:row_y+45, col_x:col_x+35] = c_height
            # Container shadow
            rgb3[row_y+45:row_y+52, col_x+10:col_x+42] = [35, 38, 40]
            
    img3 = Image.fromarray(rgb3)
    p3 = os.path.join(DEMO_DIR, "demo_coastal_facility.png")
    d3 = os.path.join(DEMO_DIR, "demo_coastal_facility_depth.npy")
    img3.save(p3)
    np.save(d3, depth3)

    print("Demo assets successfully written to:", DEMO_DIR)

if __name__ == "__main__":
    generate_demo_assets()
